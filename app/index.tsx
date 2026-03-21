import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import {
  Plus,
  ChevronDown,
  Lock,
  Unlock,
  MessageSquare,
  Square,
  GitBranch,
  Zap,
  ArrowUp,
  TerminalSquare,
  Sparkles,
  ListChecks,
  Check,
  Menu,
  X,
  Settings,
  Folder
} from 'lucide-react-native';
import { SproutIcon, SparkleIcon } from '@/components/icons';
import { Stack } from 'expo-router';
import { performClone } from '@/lib/gitActions';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const SidebarItem = ({ status, label, active, timeago, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.sidebarItem, active && styles.sidebarItemActive]}
  >
    <View style={styles.sidebarItemLeft}>
      {status === 'working' && (
        <View style={styles.workingBadge}>
          <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.workingText}>Working</Text>
        </View>
      )}
      <Text style={[styles.sidebarItemLabel, active && styles.sidebarItemLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
    {timeago && (
      <Text style={[styles.sidebarItemTime, active && { color: '#a1a1aa' }]}>
        {timeago}
      </Text>
    )}
  </TouchableOpacity>
);

const SidebarGroup = ({ title, icon, defaultExpanded = true, children }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.sidebarGroup}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.sidebarGroupHeader}
      >
        <ChevronDown
          size={12}
          color="#52525b"
          style={{ transform: [{ rotate: expanded ? '0deg' : '-90deg' }] }}
        />
        {icon ? (
          <View style={styles.sidebarGroupIcon}>{icon}</View>
        ) : (
          <Folder size={14} color="#71717a" style={{ marginHorizontal: 4 }} />
        )}
        <Text style={styles.sidebarGroupTitle} numberOfLines={1}>{title}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.sidebarGroupContent}>{children}</View>}
    </View>
  );
};

const CommandItem = ({ cmd }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await Clipboard.setStringAsync(cmd.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity onPress={handleCopy} style={styles.commandItem}>
      <View style={styles.commandBullet} />
      <Text style={styles.commandType}>{cmd.type}</Text>
      <Text style={styles.commandPath} numberOfLines={1}>{cmd.path}</Text>
      {copied && (
        <View style={styles.copiedBadge}>
          <Check size={10} color="#34d399" />
          <Text style={styles.copiedText}>Copied!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ToolCallCard = ({ count, commands }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <View style={styles.toolCard}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.toolCardHeader}
      >
        <View style={styles.toolCardHeaderLeft}>
          <TerminalSquare size={12} color="#71717a" />
          <Text style={styles.toolCardTitle}>Tool Calls ({count || commands.length})</Text>
        </View>
        <ChevronDown
          size={14}
          color="#52525b"
          style={{ transform: [{ rotate: expanded ? '0deg' : '180deg' }] }}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.toolCardContent}>
          {commands.map((cmd, i) => (
            <CommandItem key={i} cmd={cmd} />
          ))}
        </View>
      )}
    </View>
  );
};

export default function App() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('chat');
  const [isFullAccess, setIsFullAccess] = useState(true);
  const [envState, setEnvState] = useState('Local');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(isMobile ? -300 : 0)).current;

  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      role: 'ai',
      content: "The repo doesn't have existing Vercel/marketing-site wiring, so I have room to add a purpose-built app instead of working around prior deployment config. I'm checking the monorepo task conventions next, then I'll scaffold `apps/site` and build the first version in one pass.",
      time: "1:10:48 PM",
      latency: "1ms",
      toolCalls: [
        { type: 'Command run complete', path: '/bin/zsh -lc "sed -n \'1,220p\' scripts/dev-runner.ts"' },
        { type: 'Command run complete', path: '/bin/zsh -lc "sed -n \'1,220p\' apps/desktop/package.json"' },
      ]
    }
  ]);

  useEffect(() => {
    if (isMobile) {
      Animated.timing(slideAnim, {
        toValue: isSidebarOpen ? 0 : -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isSidebarOpen]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: "I've analyzed your request. I'll begin scaffolding the necessary directories.",
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        latency: "142ms"
      }]);
    }, 1500);
  };

  const getModeConfig = () => {
    switch(mode) {
      case 'agent': return { label: 'Agent', icon: <Sparkles size={14} color="#60a5fa" /> };
      case 'plan': return { label: 'Plan', icon: <ListChecks size={14} color="#34d399" /> };
      default: return { label: 'Chat', icon: <MessageSquare size={14} color="#a1a1aa" /> };
    }
  };

  const modeConfig = getModeConfig();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {isMobile && isSidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
        />
      )}

      <Animated.View style={[
        styles.sidebar, 
        isMobile && { transform: [{ translateX: slideAnim }] },
        { paddingTop: insets.top, paddingBottom: insets.bottom }
      ]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.projectsTitle}>PROJECTS</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Plus size={14} color="#52525b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.sidebarNav}>
          <SidebarGroup title="universal-package-maint..." icon={<Zap size={14} color="#8b5cf6" />}>
            <SidebarItem label="I want to start building this ..." timeago="28m ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
            <SidebarItem label="I want to start building this ..." timeago="38m ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
          </SidebarGroup>
          <SidebarGroup title="t3code-1" defaultExpanded={false} />
          <SidebarGroup title="round" defaultExpanded={false} icon={<View style={{width: 14, height: 14, borderRadius: 4, backgroundColor: '#db2777'}} />} />
          <SidebarGroup title="lawn" icon={<SproutIcon color="#22c55e" size={14} />}>
            <SidebarItem status="working" label="I just migrated thi..." active timeago="2m ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
            <SidebarItem label="How hard would it be to buil..." timeago="10d ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
            <SidebarItem label="What potential security issu..." timeago="10d ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
            <SidebarItem label="Help me analyze this project" timeago="10d ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
          </SidebarGroup>
          <SidebarGroup title="shoo" defaultExpanded={false} />
        </ScrollView>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={16} color="#71717a" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.mainInner, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {isMobile && (
                <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={[styles.iconButton, { marginRight: 8 }]}>
                  <Menu size={18} color="#a1a1aa" />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle} numberOfLines={1}>I need to create a marketing site...</Text>
            </View>
            <TouchableOpacity style={styles.headerActionButton}>
              <GitBranch size={13} color="#a1a1aa" />
              <Text style={styles.headerActionText}>Open</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatFeed}
            contentContainerStyle={styles.chatFeedContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={msg.role === 'user' ? styles.userMessageRow : styles.aiMessageRow}>
                {msg.role === 'user' ? (
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{msg.content}</Text>
                  </View>
                ) : (
                  <View style={styles.aiBubble}>
                    <Text style={styles.messageTextGroup}>{msg.content}</Text>
                    <View style={styles.aiMetadata}>
                      <Text style={styles.aiMetadataText}>{msg.time}</Text>
                      {msg.latency && <View style={styles.aiMetadataDot} />}
                      {msg.latency && <Text style={styles.aiMetadataText}>{msg.latency}</Text>}
                    </View>
                    {msg.toolCalls && <ToolCallCard commands={msg.toolCalls} />}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Ask anything, @tag files..."
                placeholderTextColor="#52525b"
                multiline
              />
              <View style={styles.inputToolbar}>
                <View style={styles.toolbarLeft}>
                  <TouchableOpacity style={styles.toolbarButton}>
                    <SparkleIcon size={12} color="#71717a" />
                    <Text style={styles.toolbarText}>GPT-5.4</Text>
                    <ChevronDown size={12} color="#52525b" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolbarButton}>
                    {modeConfig.icon}
                    <Text style={styles.toolbarText}>{modeConfig.label}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolbarButton}>
                    {isFullAccess ? <Unlock size={12} color="#a1a1aa" /> : <Lock size={12} color="#fdba74" />}
                    <Text style={styles.toolbarText}>Full access</Text>
                  </TouchableOpacity>
                </View>
                {inputValue.length > 0 && (
                  <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
                    <ArrowUp size={14} color="#000" strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.footerContext}>
              <Text style={styles.footerContextText}>{envState}</Text>
              <TouchableOpacity style={styles.footerBranch}>
                <Text style={styles.footerContextText}>MAIN</Text>
                <ChevronDown size={10} color="#52525b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', flexDirection: 'row' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40 },
  sidebar: { 
    width: 250, 
    backgroundColor: '#0c0c0c', 
    borderRightWidth: 1, 
    borderColor: '#1a1a1a', 
    zIndex: 50,
    ...Platform.select({ ios: { position: 'absolute', height: '100%' }, android: { position: 'absolute', height: '100%' } })
  },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 48 },
  projectsTitle: { color: '#52525b', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  sidebarNav: { flex: 1 },
  sidebarGroup: { marginBottom: 4 },
  sidebarGroupHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  sidebarGroupTitle: { fontSize: 13, fontWeight: '600', color: '#e5e5e5' },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 34, paddingRight: 12, paddingVertical: 7 },
  sidebarItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  workingBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  workingText: { color: '#3b82f6', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  sidebarItemLabel: { fontSize: 13, color: '#71717a' },
  sidebarItemLabelActive: { color: '#f4f4f5' },
  sidebarItemTime: { fontSize: 11, color: '#3f3f46' },
  sidebarFooter: { padding: 16, borderTopWidth: 1, borderColor: '#1a1a1a' },
  settingsButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsText: { fontSize: 13, color: '#71717a' },
  main: { flex: 1, backgroundColor: '#000' },
  mainInner: { flex: 1 },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#1a1a1a' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 13, fontWeight: '500', color: '#d4d4d8' },
  headerActionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 6 },
  headerActionText: { fontSize: 12, color: '#71717a' },
  chatFeed: { flex: 1 },
  chatFeedContent: { padding: 16, gap: 20 },
  aiBubble: { width: '100%', gap: 10 },
  messageTextGroup: { color: '#d4d4d8', fontSize: 14, lineHeight: 22 },
  aiMetadata: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.6 },
  aiMetadataText: { fontSize: 11, color: '#71717a' },
  aiMetadataDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#3f3f46' },
  toolCard: { borderWidth: 1, borderColor: '#1a1a1a', backgroundColor: '#0a0a0a', borderRadius: 8, marginTop: 8 },
  toolCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#1a1a1a' },
  toolCardTitle: { fontSize: 10, fontWeight: '700', color: '#71717a', textTransform: 'uppercase' },
  toolCardContent: { padding: 10, gap: 4 },
  inputWrapper: { paddingHorizontal: 12, paddingTop: 4 },
  inputContainer: { backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 12, padding: 10 },
  textInput: { color: '#f4f4f5', fontSize: 14, minHeight: 20, maxHeight: 100, padding: 0 },
  inputToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  toolbarLeft: { flexDirection: 'row', gap: 8 },
  toolbarButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 },
  toolbarText: { fontSize: 12, color: '#71717a' },
  sendButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  footerContext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  footerContextText: { fontSize: 10, color: '#3f3f46', fontWeight: '700' },
  footerBranch: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconButton: { padding: 4 }
});


