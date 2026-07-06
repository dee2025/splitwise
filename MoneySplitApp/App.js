import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = "moneysplit_token";
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "http://10.0.2.2:3000";

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

async function requestApi(path, { token, method = "GET", body } = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Cookie = `token=${token}`;
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      Object.values(data?.errors || {})[0] ||
      "Request failed";
    throw new Error(message);
  }

  return data;
}

function initials(name = "MS") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Pill({ children, tone = "neutral" }) {
  return <Text style={[styles.pill, styles[`pill_${tone}`]]}>{children}</Text>;
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function Button({ title, onPress, variant = "primary", disabled }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, styles[`buttonText_${variant}`]]}>{title}</Text>
    </Pressable>
  );
}

function GoogleLoginButton({ onAuthenticated }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const [, googleResponse, promptGoogle] = Google.useAuthRequest({
    webClientId: googleWebClientId || googleAndroidClientId,
    androidClientId: googleAndroidClientId,
  });

  const finishAuth = useCallback(
    async (payload) => {
      if (!payload?.token) {
        throw new Error("The server did not return a mobile token.");
      }
      await SecureStore.setItemAsync(TOKEN_KEY, payload.token);
      onAuthenticated(payload.user, payload.token);
    },
    [onAuthenticated],
  );

  useEffect(() => {
    async function handleGoogle() {
      if (googleResponse?.type !== "success") return;
      const credential =
        googleResponse.authentication?.idToken || googleResponse.params?.id_token;

      if (!credential) {
        Alert.alert("Google sign-in", "Google did not return an ID token.");
        return;
      }

      try {
        setGoogleLoading(true);
        const payload = await requestApi("/auth/google-login", {
          method: "POST",
          body: { credential },
        });
        await finishAuth(payload);
      } catch (error) {
        Alert.alert("Google sign-in failed", error.message);
      } finally {
        setGoogleLoading(false);
      }
    }

    handleGoogle();
  }, [finishAuth, googleResponse]);

  return (
    <Button
      title={googleLoading ? "Connecting..." : "Continue with Google"}
      variant="secondary"
      disabled={googleLoading}
      onPress={() => promptGoogle()}
    />
  );
}

function GoogleUnavailableButton() {
  return (
    <Button
      title="Continue with Google"
      variant="secondary"
      onPress={() => {
        Alert.alert(
          "Google sign-in not configured",
          "Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in MoneySplitApp/.env before using Google sign-in on Android.",
        );
      }}
    />
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const finishAuth = useCallback(
    async (payload) => {
      if (!payload?.token) {
        throw new Error("The server did not return a mobile token.");
      }
      await SecureStore.setItemAsync(TOKEN_KEY, payload.token);
      onAuthenticated(payload.user, payload.token);
    },
    [onAuthenticated],
  );

  const submit = async () => {
    try {
      setLoading(true);
      const path = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload = await requestApi(path, {
        method: "POST",
        body:
          mode === "login"
            ? { email, password }
            : {
                fullName,
                email,
                password,
                confirmPassword: password,
              },
      });
      await finishAuth(payload);
    } catch (error) {
      Alert.alert(mode === "login" ? "Login failed" : "Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const canUseGoogle = Platform.OS === "android" ? !!googleAndroidClientId : !!(googleWebClientId || googleAndroidClientId);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.authWrap}
      >
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>MS</Text>
          </View>
          <Text style={styles.brandTitle}>MoneySplit</Text>
          <Text style={styles.brandSubtitle}>Split group expenses, track balances, and keep shared money clear.</Text>
        </View>

        <View style={styles.authCard}>
          <View style={styles.segment}>
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.segmentItem, mode === "login" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, mode === "login" && styles.segmentTextActive]}>Login</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("signup")}
              style={[styles.segmentItem, mode === "signup" && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, mode === "signup" && styles.segmentTextActive]}>Signup</Text>
            </Pressable>
          </View>

          {mode === "signup" && (
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Rahul Sharma" />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />

          <Button title={loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"} onPress={submit} disabled={loading} />
          {canUseGoogle ? <GoogleLoginButton onAuthenticated={onAuthenticated} /> : <GoogleUnavailableButton />}
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Dashboard({ user, profile, groups, expenses, notifications, onRefresh, refreshing }) {
  const totalGroups = groups.length;
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const unread = notifications.filter((item) => !item.isRead).length;

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.heroPanel}>
        <View>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.heroTitle}>{user?.fullName || profile?.user?.fullName || "MoneySplit User"}</Text>
          <Text style={styles.heroCopy}>Your shared money dashboard is ready.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user?.fullName || profile?.user?.fullName)}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalGroups}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{money(totalExpenses)}</Text>
          <Text style={styles.statLabel}>Tracked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unread}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent groups</Text>
      {groups.slice(0, 4).map((group) => (
        <View key={group._id} style={styles.listCard}>
          <View>
            <Text style={styles.cardTitle}>{group.name}</Text>
            <Text style={styles.cardMeta}>{group.members?.length || 0} members</Text>
          </View>
          <Pill tone="green">{money(group.totalExpenses)}</Pill>
        </View>
      ))}
      {!groups.length && <EmptyState title="No groups yet" body="Create your first group to start splitting expenses." />}

      <Text style={styles.sectionTitle}>Recent expenses</Text>
      {expenses.slice(0, 5).map((expense) => (
        <View key={expense._id} style={styles.listCard}>
          <View style={styles.listText}>
            <Text style={styles.cardTitle}>{expense.description}</Text>
            <Text style={styles.cardMeta}>{expense.groupId?.name || "Group"} · {expense.category || "other"}</Text>
          </View>
          <Text style={styles.amount}>{money(expense.amount)}</Text>
        </View>
      ))}
      {!expenses.length && <EmptyState title="No expenses yet" body="Add an expense after creating a group." />}
    </ScrollView>
  );
}

function EmptyState({ title, body }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function GroupsScreen({ token, groups, onChanged, refreshing, onRefresh }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Groups</Text>
            <Text style={styles.screenSubtitle}>Create and manage shared spending spaces.</Text>
          </View>
          <Button title="New" onPress={() => setOpen(true)} />
        </View>

        {groups.map((group) => (
          <View key={group._id} style={styles.groupCard}>
            <View style={styles.groupTop}>
              <View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.cardMeta}>{group.description || "Private money split group"}</Text>
              </View>
              <Pill>{group.privacy || "private"}</Pill>
            </View>
            <View style={styles.groupFooter}>
              <Text style={styles.cardMeta}>{group.members?.length || 0} members</Text>
              <Text style={styles.amount}>{money(group.totalExpenses)}</Text>
            </View>
          </View>
        ))}
        {!groups.length && <EmptyState title="No groups" body="Tap New to create a group for trips, rent, food, or friends." />}
      </ScrollView>
      <GroupModal token={token} visible={open} onClose={() => setOpen(false)} onChanged={onChanged} />
    </View>
  );
}

function GroupModal({ token, visible, onClose, onChanged }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("other");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function search() {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        const data = await requestApi(`/users/search?q=${encodeURIComponent(query.trim())}`, { token });
        if (active) setResults(data.users || []);
      } catch {
        if (active) setResults([]);
      }
    }
    const id = setTimeout(search, 300);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query, token]);

  const create = async () => {
    try {
      setSaving(true);
      await requestApi("/groups", {
        token,
        method: "POST",
        body: {
          name,
          description,
          privacy: "private",
          type,
          members,
        },
      });
      setName("");
      setDescription("");
      setMembers([]);
      setQuery("");
      onClose();
      onChanged();
    } catch (error) {
      Alert.alert("Group creation failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.modalScreen}>
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Create group</Text>
            <Button title="Close" variant="ghost" onPress={onClose} />
          </View>
          <Field label="Group name" value={name} onChangeText={setName} placeholder="Goa trip" />
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="Optional details" multiline />
          <Text style={styles.label}>Group type</Text>
          <View style={styles.chips}>
            {["trip", "home", "couple", "friends", "other"].map((item) => (
              <Pressable key={item} onPress={() => setType(item)} style={[styles.chip, type === item && styles.chipActive]}>
                <Text style={[styles.chipText, type === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Field label="Add registered members" value={query} onChangeText={setQuery} placeholder="Search name or email" />
          {results.map((person) => (
            <Pressable
              key={person.id}
              style={styles.searchResult}
              onPress={() => {
                if (!members.some((item) => item.userId === person.id)) {
                  setMembers((current) => [
                    ...current,
                    {
                      userId: person.id,
                      name: person.fullName,
                      email: person.email,
                      contact: person.contact,
                      type: "registered",
                    },
                  ]);
                }
                setQuery("");
                setResults([]);
              }}
            >
              <Text style={styles.cardTitle}>{person.fullName}</Text>
              <Text style={styles.cardMeta}>{person.email}</Text>
            </Pressable>
          ))}
          {!!members.length && (
            <View style={styles.memberBox}>
              {members.map((member) => (
                <View key={member.userId} style={styles.memberRow}>
                  <Text style={styles.cardTitle}>{member.name}</Text>
                  <Pressable onPress={() => setMembers((current) => current.filter((item) => item.userId !== member.userId))}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <Button title={saving ? "Creating..." : "Create group"} onPress={create} disabled={saving} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function ExpensesScreen({ token, groups, expenses, onChanged, refreshing, onRefresh }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Expenses</Text>
            <Text style={styles.screenSubtitle}>Add bills and split them equally.</Text>
          </View>
          <Button title="Add" onPress={() => setOpen(true)} disabled={!groups.length} />
        </View>
        {expenses.map((expense) => (
          <View key={expense._id} style={styles.listCard}>
            <View style={styles.listText}>
              <Text style={styles.cardTitle}>{expense.description}</Text>
              <Text style={styles.cardMeta}>
                {expense.groupId?.name || "Group"} · {new Date(expense.date || expense.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amount}>{money(expense.amount)}</Text>
          </View>
        ))}
        {!expenses.length && <EmptyState title="No expenses" body="Create a group first, then add shared costs here." />}
      </ScrollView>
      <ExpenseModal token={token} groups={groups} visible={open} onClose={() => setOpen(false)} onChanged={onChanged} />
    </View>
  );
}

function ExpenseModal({ token, groups, visible, onClose, onChanged }) {
  const [groupId, setGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const selectedGroup = groups.find((group) => group._id === groupId) || groups[0];

  useEffect(() => {
    if (!groupId && groups[0]?._id) setGroupId(groups[0]._id);
  }, [groupId, groups]);

  const registeredMembers = useMemo(
    () => (selectedGroup?.members || []).filter((member) => member.userId),
    [selectedGroup],
  );

  const create = async () => {
    const numericAmount = Number(amount);
    if (!registeredMembers.length) {
      Alert.alert("No registered members", "This group needs registered members before expenses can be split.");
      return;
    }

    const equal = Number((numericAmount / registeredMembers.length).toFixed(2));
    const split = registeredMembers.map((member) => ({
      userId: String(member.userId),
      amount: equal,
      percentage: Number((100 / registeredMembers.length).toFixed(2)),
    }));
    const used = split.reduce((sum, item) => sum + item.amount, 0);
    split[split.length - 1].amount = Number((split[split.length - 1].amount + (numericAmount - used)).toFixed(2));

    try {
      await requestApi("/expenses", {
        token,
        method: "POST",
        body: {
          description,
          amount: numericAmount,
          groupId: selectedGroup._id,
          category,
          splitBetween: split,
          paidTo: split.map((item) => item.userId),
        },
      });
      setDescription("");
      setAmount("");
      onClose();
      onChanged();
    } catch (error) {
      Alert.alert("Expense creation failed", error.message);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.modalScreen}>
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Add expense</Text>
            <Button title="Close" variant="ghost" onPress={onClose} />
          </View>
          <Text style={styles.label}>Group</Text>
          <View style={styles.groupSelect}>
            {groups.map((group) => (
              <Pressable key={group._id} onPress={() => setGroupId(group._id)} style={[styles.groupOption, groupId === group._id && styles.groupOptionActive]}>
                <Text style={[styles.groupOptionText, groupId === group._id && styles.groupOptionTextActive]}>{group.name}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="Dinner, fuel, rent" />
          <Field label="Amount" value={amount} onChangeText={setAmount} placeholder="1200" keyboardType="decimal-pad" />
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {["food", "travel", "accommodation", "shopping", "entertainment", "other"].map((item) => (
              <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.helperText}>This app splits the amount equally across registered members in the selected group.</Text>
          <Button title="Add expense" onPress={create} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function NotificationsScreen({ notifications, refreshing, onRefresh }) {
  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.screenTitle}>Notifications</Text>
      <Text style={styles.screenSubtitle}>Group invitations and expense updates.</Text>
      {notifications.map((item) => (
        <View key={item._id} style={styles.listCard}>
          <View style={styles.listText}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.message}</Text>
          </View>
          {!item.isRead && <Pill tone="green">New</Pill>}
        </View>
      ))}
      {!notifications.length && <EmptyState title="No notifications" body="Updates will appear here when groups and expenses change." />}
    </ScrollView>
  );
}

function SettingsScreen({ token, profile, onLogout, onChanged }) {
  const user = profile?.user || {};
  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [contact, setContact] = useState(user.contact || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user.fullName || "");
    setUsername(user.username || "");
    setContact(user.contact || "");
    setBio(user.bio || "");
  }, [user.bio, user.contact, user.fullName, user.username]);

  const save = async () => {
    try {
      setSaving(true);
      await requestApi("/users/profile", {
        token,
        method: "PUT",
        body: { fullName, username, contact, bio },
      });
      onChanged();
      Alert.alert("Profile updated", "Your settings were saved.");
    } catch (error) {
      Alert.alert("Profile update failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.screenTitle}>Settings</Text>
      <Text style={styles.screenSubtitle}>Manage your MoneySplit profile.</Text>
      <View style={styles.settingsCard}>
        <Field label="Full name" value={fullName} onChangeText={setFullName} />
        <Field label="Username" value={username} onChangeText={setUsername} />
        <Field label="Contact" value={contact} onChangeText={setContact} keyboardType="phone-pad" />
        <Field label="Bio" value={bio} onChangeText={setBio} multiline />
        <Button title={saving ? "Saving..." : "Save profile"} onPress={save} disabled={saving} />
        <Button title="Logout" variant="danger" onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

function MainApp({ token, initialUser, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [profileData, groupsData, expensesData, notificationsData] = await Promise.all([
      requestApi("/users/profile", { token }),
      requestApi("/groups", { token }),
      requestApi("/expenses", { token }),
      requestApi("/notifications", { token }),
    ]);
    setProfile(profileData);
    setUser(profileData.user || initialUser);
    setGroups(groupsData.groups || []);
    setExpenses(expensesData.expenses || []);
    setNotifications(notificationsData.notifications || []);
  }, [initialUser, token]);

  useEffect(() => {
    loadData().catch((error) => {
      if (/unauthorized/i.test(error.message)) onLogout();
    });
  }, [loadData, onLogout]);

  const refresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      Alert.alert("Refresh failed", error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const content =
    tab === "dashboard" ? (
      <Dashboard user={user} profile={profile} groups={groups} expenses={expenses} notifications={notifications} onRefresh={refresh} refreshing={refreshing} />
    ) : tab === "groups" ? (
      <GroupsScreen token={token} groups={groups} onChanged={refresh} onRefresh={refresh} refreshing={refreshing} />
    ) : tab === "expenses" ? (
      <ExpensesScreen token={token} groups={groups} expenses={expenses} onChanged={refresh} onRefresh={refresh} refreshing={refreshing} />
    ) : tab === "notifications" ? (
      <NotificationsScreen notifications={notifications} onRefresh={refresh} refreshing={refreshing} />
    ) : (
      <SettingsScreen token={token} profile={profile} onChanged={refresh} onLogout={onLogout} />
    );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appShell}>{content}</View>
      <View style={styles.tabBar}>
        {[
          ["dashboard", "Home"],
          ["groups", "Groups"],
          ["expenses", "Expenses"],
          ["notifications", "Alerts"],
          ["settings", "Settings"],
        ].map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.tabItem, tab === key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function boot() {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        try {
          const data = await requestApi("/auth/me", { token: stored });
          setToken(stored);
          setUser(data.user);
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }
      setBooting(false);
    }
    boot();
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  if (booting) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Opening MoneySplit</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <AuthScreen
        onAuthenticated={(nextUser, nextToken) => {
          setUser(nextUser);
          setToken(nextToken);
        }}
      />
    );
  }

  return <MainApp token={token} initialUser={user} onLogout={logout} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8f3",
  },
  flex: {
    flex: 1,
  },
  appShell: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#475569",
    fontWeight: "700",
  },
  authWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  brandBlock: {
    marginBottom: 22,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
  },
  brandTitle: {
    color: "#102a2a",
    fontSize: 36,
    fontWeight: "900",
  },
  brandSubtitle: {
    color: "#5b6b6b",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#edf2f2",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: "#ffffff",
  },
  segmentText: {
    color: "#64748b",
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#0f766e",
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d8e0e0",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#0f172a",
    backgroundColor: "#fbfdfd",
    fontSize: 16,
  },
  textArea: {
    minHeight: 92,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button_primary: {
    backgroundColor: "#0f766e",
  },
  button_secondary: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#d8e0e0",
  },
  button_ghost: {
    backgroundColor: "transparent",
  },
  button_danger: {
    backgroundColor: "#b91c1c",
  },
  buttonText: {
    fontWeight: "900",
    fontSize: 15,
  },
  buttonText_primary: {
    color: "#ffffff",
  },
  buttonText_secondary: {
    color: "#0f172a",
  },
  buttonText_ghost: {
    color: "#0f766e",
  },
  buttonText_danger: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
  screen: {
    padding: 18,
    paddingBottom: 110,
  },
  modalScreen: {
    padding: 18,
    paddingBottom: 34,
  },
  heroPanel: {
    minHeight: 170,
    backgroundColor: "#12302e",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    color: "#a7f3d0",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 10,
    maxWidth: 240,
  },
  heroCopy: {
    color: "#cbd5d5",
    marginTop: 8,
    fontSize: 15,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#e7ff9c",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#12302e",
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statValue: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#64748b",
    fontWeight: "700",
    marginTop: 5,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
  },
  screenTitle: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "900",
  },
  screenSubtitle: {
    color: "#64748b",
    fontSize: 15,
    marginTop: 5,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  listText: {
    flex: 1,
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900",
  },
  cardMeta: {
    color: "#64748b",
    marginTop: 4,
    lineHeight: 19,
  },
  amount: {
    color: "#0f766e",
    fontWeight: "900",
  },
  pill: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#334155",
    backgroundColor: "#eef2f1",
    fontWeight: "900",
    fontSize: 12,
  },
  pill_green: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  pill_neutral: {
    backgroundColor: "#eef2f1",
    color: "#334155",
  },
  empty: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  emptyTitle: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 17,
  },
  emptyBody: {
    color: "#64748b",
    marginTop: 6,
    lineHeight: 20,
  },
  groupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  groupTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  groupName: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "900",
  },
  groupFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#edf2f2",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: "#eef2f1",
  },
  chipActive: {
    backgroundColor: "#0f766e",
  },
  chipText: {
    color: "#475569",
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  searchResult: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  memberBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  memberRow: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f2",
  },
  removeText: {
    color: "#b91c1c",
    fontWeight: "900",
  },
  groupSelect: {
    gap: 8,
    marginBottom: 14,
  },
  groupOption: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8e0e0",
    padding: 13,
    backgroundColor: "#ffffff",
  },
  groupOptionActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  groupOptionText: {
    color: "#334155",
    fontWeight: "900",
  },
  groupOptionTextActive: {
    color: "#ffffff",
  },
  helperText: {
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  settingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 68,
    borderRadius: 24,
    backgroundColor: "#102a2a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#0f172a",
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#e7ff9c",
  },
  tabText: {
    color: "#d5dddd",
    fontSize: 12,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#102a2a",
  },
});
