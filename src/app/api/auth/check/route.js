import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ 
        isAuthenticated: false 
      });
    }

    const decoded = await verifyToken(token);
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      const response = NextResponse.json({ 
        isAuthenticated: false 
      });
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        contact: user.contact,
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    const response = NextResponse.json({ 
      isAuthenticated: false 
    });
    response.cookies.delete('token');
    return response;
  }
}