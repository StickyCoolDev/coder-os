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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  X
} from 'lucide-react-native';
import { SproutIcon, SparkleIcon } from '@/components/icons';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const SidebarItem = ({ status, label, active, timeago, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.sidebarItem, active && styles.sidebarItemActive]}
  >
    <View style={styles.statusDotContainer}>
      {status === 'working' && <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />}
      {status === 'completed' && <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />}
      {status === 'idle' && <View style={[styles.statusDot, { backgroundColor: '#52525b', width: 6, height: 6 }]} />}
    </View>
    <Text style={[styles.sidebarItemLabel, active && styles.sidebarItemLabelActive]} numberOfLines={1}>
      {label}
    </Text>
    {(active || timeago) && (
      <Text style={[styles.sidebarItemTime, active && { color: '#a1a1aa' }]}>
        {timeago || '1m ago'}
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
          size={14}
          color="#71717a"
          style={{ transform: [{ rotate: expanded ? '0deg' : '-90deg' }] }}
        />
        {icon && <View style={styles.sidebarGroupIcon}>{icon}</View>}
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
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isSidebarOpen]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I've analyzed your request. Let me review a few configuration files before I proceed.",
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        latency: "142ms",
        toolCalls: [
          { type: 'Command run complete', path: '/bin/zsh -lc "npm run analyze:deps"' }
        ]
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  const toggleMode = () => {
    const modes = ['chat', 'agent', 'plan'];
    setMode(modes[(modes.indexOf(mode) + 1) % modes.length]);
  };

  const getModeConfig = () => {
    switch(mode) {
      case 'agent': return { label: 'Agent', icon: <Sparkles size={14} color="#60a5fa" /> };
      case 'plan': return { label: 'Plan', icon: <ListChecks size={14} color="#34d399" /> };
      default: return { label: 'Chat', icon: <MessageSquare size={14} color="#a1a1aa" /> };
    }
  };

  const modeConfig = getModeConfig();

  const renderMessageContent = (content) => {
    const parts = content.split(/(`[^`]+`)/);
    return (
      <Text style={styles.messageTextGroup}>
        {parts.map((part, i) =>
          part.startsWith('`') && part.endsWith('`') ? (
            <Text key={i} style={styles.inlineCode}>{part.slice(1, -1)}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

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

      {/* Sidebar Overlay for Mobile / Static for Web */}
      <Animated.View style={[
        styles.sidebar, 
        isMobile && { transform: [{ translateX: slideAnim }] },
        { paddingTop: insets.top, paddingBottom: insets.bottom }
      ]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>CoderOS <Text style={styles.alphaTag}>ALPHA</Text></Text>
          {isMobile && (
            <TouchableOpacity onPress={() => setIsSidebarOpen(false)} style={styles.iconButton}>
              <X size={16} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.sidebarNav}>
          <SidebarGroup title="coderos-1" icon={<Zap size={12} color="#fbbf24" />}>
            <SidebarItem status="working" label="I need to create a m..." active timeago="1m ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
            <SidebarItem status="working" label="I want a way to mo..." timeago="6m ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
          </SidebarGroup>
          <SidebarGroup title="lawn" icon={<SproutIcon color="#34d399" />}>
            <SidebarItem status="completed" label="How hard would..." timeago="7m ago" onPress={() => isMobile && setIsSidebarOpen(false)} />
          </SidebarGroup>
        </ScrollView>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity style={styles.addProjectButton}>
            <Plus size={14} color="#a1a1aa" />
            <Text style={styles.addProjectText}>Add project</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerActionButton}>
                <GitBranch size={13} color="#a1a1aa" />
                <Text style={styles.headerActionText}>Open</Text>
              </TouchableOpacity>
            </View>
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
                    {renderMessageContent(msg.content)}
                    <View style={styles.aiMetadata}>
                      <Text style={styles.aiMetadataText}>{msg.time}</Text>
                      <View style={styles.aiMetadataDot} />
                      <Text style={styles.aiMetadataText}>{msg.latency}</Text>
                    </View>
                    {msg.toolCalls && <ToolCallCard commands={msg.toolCalls} />}
                  </View>
                )}
              </View>
            ))}
            {isTyping && (
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { opacity: 0.6 }]} />
                <View style={[styles.typingDot, { opacity: 0.3 }]} />
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Ask anything, @tag files..."
                placeholderTextColor="#71717a"
                multiline
                maxLength={2000}
              />

              <View style={styles.inputToolbar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbarScroll}>
                  <TouchableOpacity style={styles.toolbarButton}>
                    <View style={styles.toolbarIconBg}><SparkleIcon size={10} /></View>
                    <Text style={styles.toolbarText}>GPT-5.4</Text>
                    <ChevronDown size={12} color="#71717a" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={toggleMode} style={styles.toolbarButton}>
                    {modeConfig.icon}
                    <Text style={styles.toolbarText}>{modeConfig.label}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setIsFullAccess(!isFullAccess)} style={[styles.toolbarButton, !isFullAccess && styles.toolbarButtonWarning]}>
                    {isFullAccess ? <Unlock size={12} color="#a1a1aa" /> : <Lock size={12} color="#fdba74" />}
                    <Text style={[styles.toolbarText, !isFullAccess && { color: '#fdba74' }]}>
                      {isFullAccess ? 'Full access' : 'Restricted'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={styles.submitContainer}>
                  {isTyping ? (
                    <TouchableOpacity style={styles.stopButton}>
                      <Square size={10} color="#fff" fill="#fff" />
                    </TouchableOpacity>
                  ) : inputValue.trim().length > 0 ? (
                    <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
                      <ArrowUp size={14} color="#000" strokeWidth={2.5} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.footerContext}>
              <TouchableOpacity onPress={() => setEnvState(envState === 'Local' ? 'Workspace' : 'Local')}>
                <Text style={styles.footerContextText}>{envState}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBranch}>
                <Text style={styles.footerContextText}>main</Text>
                <ChevronDown size={10} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', flexDirection: 'row' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 40 },
  sidebar: { 
    width: 260, 
    backgroundColor: '#0c0c0c', 
    borderRightWidth: 1, 
    borderColor: 'rgba(39, 39, 42, 0.4)', 
    zIndex: 50, 
    ...Platform.select({ 
      ios: { position: 'absolute', height: '100%', left: 0 },
      android: { position: 'absolute', height: '100%', left: 0 },
      web: { position: 'relative' } 
    }) 
  },
  sidebarHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: 'rgba(39, 39, 42, 0.4)' },
  sidebarTitle: { color: '#f4f4f5', fontSize: 14, fontWeight: '600' },
  alphaTag: { fontSize: 8, color: '#71717a', borderWidth: 1, borderColor: 'rgba(63, 63, 70, 0.4)', paddingHorizontal: 4, borderRadius: 2 },
  iconButton: { padding: 6, borderRadius: 6 },
  sidebarNav: { flex: 1, padding: 12 },
  sidebarGroup: { marginBottom: 16 },
  sidebarGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, marginBottom: 6 },
  sidebarGroupTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#71717a', letterSpacing: 0.5 },
  sidebarGroupContent: { gap: 2 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  sidebarItemActive: { backgroundColor: 'rgba(39, 39, 42, 0.8)' },
  statusDotContainer: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  sidebarItemLabel: { flex: 1, fontSize: 13, color: '#a1a1aa', fontWeight: '500' },
  sidebarItemLabelActive: { color: '#f4f4f5' },
  sidebarItemTime: { fontSize: 10, color: '#52525b' },
  sidebarFooter: { padding: 16, borderTopWidth: 1, borderColor: 'rgba(39, 39, 42, 0.4)' },
  addProjectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.8)', borderRadius: 8 },
  addProjectText: { fontSize: 12, fontWeight: '500', color: '#a1a1aa' },
  main: { flex: 1, backgroundColor: '#080808' },
  mainInner: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: 'rgba(39, 39, 42, 0.4)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 13, fontWeight: '500', color: '#e4e4e7', flexShrink: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerActionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 6 },
  headerActionText: { fontSize: 12, color: '#a1a1aa', fontWeight: '500' },
  chatFeed: { flex: 1 },
  chatFeedContent: { padding: 20, paddingBottom: 20, gap: 24 },
  userMessageRow: { alignItems: 'flex-end', width: '100%' },
  aiMessageRow: { alignItems: 'flex-start', width: '100%' },
  userBubble: { backgroundColor: '#27272a', borderWidth: 1, borderColor: 'rgba(63, 63, 70, 0.6)', padding: 12, borderRadius: 16, borderTopRightRadius: 4, maxWidth: '90%' },
  userBubbleText: { color: '#e4e4e7', fontSize: 14, lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  aiBubble: { width: '100%', gap: 12 },
  messageTextGroup: { color: '#d4d4d8', fontSize: 15, lineHeight: 24 },
  inlineCode: { backgroundColor: 'rgba(39, 39, 42, 0.8)', color: '#e4e4e7', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, borderWidth: 1, borderColor: 'rgba(63, 63, 70, 0.8)' },
  aiMetadata: { flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.8 },
  aiMetadataText: { fontSize: 11, color: '#71717a', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  aiMetadataDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#3f3f46' },
  toolCard: { borderWidth: 1, borderColor: 'rgba(39, 39, 42, 0.6)', backgroundColor: 'rgba(20, 20, 20, 0.5)', borderRadius: 12, overflow: 'hidden' },
  toolCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: 'rgba(39, 39, 42, 0.6)' },
  toolCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolCardTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: 0.5 },
  toolCardContent: { padding: 12, gap: 4 },
  commandItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  commandBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3f3f46', marginTop: 8 },
  commandType: { fontSize: 12, color: '#71717a', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  commandPath: { flex: 1, fontSize: 12, color: '#d4d4d8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  copiedBadge: { position: 'absolute', right: 0, top: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  copiedText: { fontSize: 10, color: '#34d399' },
  typingIndicator: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#52525b' },
  inputWrapper: { padding: 12, backgroundColor: '#080808', borderTopWidth: 1, borderColor: 'rgba(39, 39, 42, 0.2)' },
  inputContainer: { borderWidth: 1, borderColor: 'rgba(63, 63, 70, 0.6)', backgroundColor: 'rgba(20, 20, 20, 0.95)', borderRadius: 16, padding: 12 },
  textInput: { color: '#f4f4f5', fontSize: 15, maxHeight: 150, minHeight: 24, padding: 0 },
  inputToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderColor: 'rgba(39, 39, 42, 0.4)', paddingTop: 12 },
  toolbarScroll: { flex: 1, marginRight: 8 },
  toolbarButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  toolbarButtonWarning: { backgroundColor: 'rgba(251, 146, 60, 0.1)' },
  toolbarIconBg: { width: 16, height: 16, backgroundColor: '#27272a', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  toolbarText: { fontSize: 12, color: '#a1a1aa', fontWeight: '500' },
  submitContainer: { justifyContent: 'flex-end', minWidth: 32 },
  sendButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stopButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ff3355', alignItems: 'center', justifyContent: 'center' },
  footerContext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 8 },
  footerContextText: { fontSize: 10, color: '#71717a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  footerBranch: { flexDirection: 'row', alignItems: 'center', gap: 4 }
});


