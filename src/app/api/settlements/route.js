import { verifyRequestToken } from "@/lib/apiAuth";
import { createActivity } from "@/lib/createActivity";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function memberKey(member) {
  return String(member.userId?._id || member.userId || member._id || "");
}

function memberName(member) {
  return member.userId?.fullName || member.name || "Member";
}

function normalizeSettlement(settlementDoc, group) {
  const settlement = settlementDoc?.toObject
    ? settlementDoc.toObject()
    : settlementDoc;
  const members = group?.members || [];
  const from = members.find((member) => memberKey(member) === settlement.fromMemberId);
  const to = members.find((member) => memberKey(member) === settlement.toMemberId);

  return {
    _id: settlement._id,
    groupId: settlement.groupId,
    fromMemberId: settlement.fromMemberId,
    fromName: from ? memberName(from) : "Member",
    toMemberId: settlement.toMemberId,
    toName: to ? memberName(to) : "Member",
    amount: settlement.amount,
    note: settlement.note || "",
    date: settlement.date,
    recordedBy: settlement.recordedBy,
    createdAt: settlement.createdAt,
  };
}

async function getAuthorizedGroup(groupId, userId) {
  if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
    return {
      error: NextResponse.json(
        { error: "Valid groupId is required" },
        { status: 400 },
      ),
    };
  }

  const group = await Group.findOne({
    _id: groupId,
    "members.userId": userId,
    isActive: { $ne: false },
  }).populate("members.userId", "fullName username email contact");

  if (!group) {
    return {
      error: NextResponse.json(
        { error: "Group not found or access denied" },
        { status: 404 },
      ),
    };
  }

  return { group };
}

export async function GET(request) {
  try {
    await connectDB();

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;

    const user = await User.findById(auth.decoded.userId).select("_id isBlocked");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const { group, error } = await getAuthorizedGroup(groupId, user._id);
    if (error) return error;

    const settlements = await Settlement.find({ groupId: group._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      settlements: settlements.map((settlement) =>
        normalizeSettlement(settlement, group),
      ),
    });
  } catch (error) {
    console.error("Settlements fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;

    const user = await User.findById(auth.decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const body = await request.json();
    const { groupId, fromMemberId, toMemberId, amount, note, date } = body;
    const { group, error } = await getAuthorizedGroup(groupId, user._id);
    if (error) return error;

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: "Settlement amount must be greater than 0" },
        { status: 400 },
      );
    }

    const fromId = String(fromMemberId || "");
    const toId = String(toMemberId || "");
    if (!fromId || !toId || fromId === toId) {
      return NextResponse.json(
        { error: "Select two different members to settle" },
        { status: 400 },
      );
    }

    const members = group.members || [];
    const fromMember = members.find((member) => memberKey(member) === fromId);
    const toMember = members.find((member) => memberKey(member) === toId);
    if (!fromMember || !toMember) {
      return NextResponse.json(
        { error: "Settlement members must belong to this group" },
        { status: 400 },
      );
    }

    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const settlement = await Settlement.create({
      groupId: group._id,
      fromMemberId: fromId,
      toMemberId: toId,
      fromUserId: fromMember.userId?._id || fromMember.userId || null,
      toUserId: toMember.userId?._id || toMember.userId || null,
      amount: Number(amountValue.toFixed(2)),
      note: String(note || "").trim().slice(0, 160),
      date: parsedDate,
      recordedBy: user._id,
    });

    await createActivity({
      groupId: group._id,
      userId: user._id,
      type: "settlement_recorded",
      message: `${memberName(fromMember)} settled with ${memberName(toMember)}`,
      metadata: {
        settlementId: settlement._id,
        fromMemberId: fromId,
        toMemberId: toId,
        amount: amountValue,
      },
    });

    return NextResponse.json(
      {
        message: "Settlement recorded successfully",
        settlement: normalizeSettlement(settlement, group),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Settlement creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
