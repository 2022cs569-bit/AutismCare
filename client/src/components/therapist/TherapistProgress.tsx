import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import {
    TrendingUp,
    User,
    Star,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowRight,
    Clock,
    Calendar,
    Target,
    Award,
    BookOpen,
    Activity,
    Brain,
    Hand,
    Eye,
    MessageCircle,
    Smile,
    Volume2,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────
interface Child {
    id: number;
    name: string;
    age: number;
    therapyType: 'Speech Therapy' | 'Occupational Therapy' | 'Behavioral Therapy';
    parentName: string;
    sessionsCompleted: number;
    totalSessions: number;
    overallProgress: number;
}

interface Metric {
    label: string;
    value: number;
    previousValue: number;
    icon: React.ReactNode;
    color: string;
}

interface WeeklyData {
    week: string;
    [key: string]: number | string;
}

interface SessionLog {
    id: number;
    date: string;
    summary: string;
    improvement: 'Improved' | 'Same' | 'Needs Attention';
    notes: string;
}

interface Milestone {
    id: number;
    title: string;
    description: string;
    status: 'Achieved' | 'In Progress' | 'Not Started';
    targetDate: string;
}

// ─── Dummy Children ──────────────────────────────────────
const children: Child[] = [
    {
        id: 1,
        name: 'Rabia Babar',
        age: 4,
        therapyType: 'Speech Therapy',
        parentName: 'Mrs. Babar',
        sessionsCompleted: 12,
        totalSessions: 15,
        overallProgress: 75,
    },
    {
        id: 2,
        name: 'Amman Fatima',
        age: 3,
        therapyType: 'Occupational Therapy',
        parentName: 'Mr. Fatima',
        sessionsCompleted: 8,
        totalSessions: 12,
        overallProgress: 60,
    },
    {
        id: 3,
        name: 'Ahmed Hassan',
        age: 2,
        therapyType: 'Behavioral Therapy',
        parentName: 'Mrs. Hassan',
        sessionsCompleted: 6,
        totalSessions: 16,
        overallProgress: 42,
    },
];

// ─── Therapy-Specific Metrics ────────────────────────────
const metricsData: Record<number, Metric[]> = {
    1: [
        { label: 'Speech Clarity', value: 72, previousValue: 60, icon: <Volume2 className="w-4 h-4" />, color: 'blue' },
        { label: 'Vocabulary Growth', value: 65, previousValue: 50, icon: <BookOpen className="w-4 h-4" />, color: 'emerald' },
        { label: 'Response Time', value: 58, previousValue: 45, icon: <Clock className="w-4 h-4" />, color: 'purple' },
    ],
    2: [
        { label: 'Fine Motor Skills', value: 68, previousValue: 52, icon: <Hand className="w-4 h-4" />, color: 'emerald' },
        { label: 'Attention Span', value: 55, previousValue: 42, icon: <Eye className="w-4 h-4" />, color: 'blue' },
        { label: 'Daily Living Tasks', value: 48, previousValue: 35, icon: <Target className="w-4 h-4" />, color: 'amber' },
    ],
    3: [
        { label: 'Social Interaction', value: 40, previousValue: 28, icon: <Smile className="w-4 h-4" />, color: 'pink' },
        { label: 'Emotional Regulation', value: 35, previousValue: 25, icon: <Brain className="w-4 h-4" />, color: 'purple' },
        { label: 'Routine Compliance', value: 52, previousValue: 40, icon: <Activity className="w-4 h-4" />, color: 'blue' },
    ],
};

// ─── Weekly Progress Charts ──────────────────────────────
const weeklyProgress: Record<number, WeeklyData[]> = {
    1: [
        { week: 'Week 1', clarity: 30, vocabulary: 22, response: 20 },
        { week: 'Week 2', clarity: 35, vocabulary: 28, response: 25 },
        { week: 'Week 3', clarity: 40, vocabulary: 32, response: 30 },
        { week: 'Week 4', clarity: 48, vocabulary: 38, response: 35 },
        { week: 'Week 5', clarity: 52, vocabulary: 42, response: 38 },
        { week: 'Week 6', clarity: 58, vocabulary: 48, response: 42 },
        { week: 'Week 7', clarity: 65, vocabulary: 55, response: 50 },
        { week: 'Week 8', clarity: 72, vocabulary: 65, response: 58 },
    ],
    2: [
        { week: 'Week 1', motor: 25, attention: 18, daily: 15 },
        { week: 'Week 2', motor: 30, attention: 22, daily: 18 },
        { week: 'Week 3', motor: 38, attention: 28, daily: 22 },
        { week: 'Week 4', motor: 42, attention: 32, daily: 28 },
        { week: 'Week 5', motor: 50, attention: 38, daily: 32 },
        { week: 'Week 6', motor: 55, attention: 42, daily: 38 },
        { week: 'Week 7', motor: 62, attention: 48, daily: 42 },
        { week: 'Week 8', motor: 68, attention: 55, daily: 48 },
    ],
    3: [
        { week: 'Week 1', social: 10, emotional: 8, routine: 15 },
        { week: 'Week 2', social: 14, emotional: 12, routine: 20 },
        { week: 'Week 3', social: 18, emotional: 15, routine: 25 },
        { week: 'Week 4', social: 22, emotional: 18, routine: 30 },
        { week: 'Week 5', social: 28, emotional: 22, routine: 36 },
        { week: 'Week 6', social: 32, emotional: 28, routine: 42 },
        { week: 'Week 7', social: 36, emotional: 30, routine: 48 },
        { week: 'Week 8', social: 40, emotional: 35, routine: 52 },
    ],
};

const chartLines: Record<number, { key: string; color: string; label: string }[]> = {
    1: [
        { key: 'clarity', color: '#3b82f6', label: 'Speech Clarity' },
        { key: 'vocabulary', color: '#10b981', label: 'Vocabulary' },
        { key: 'response', color: '#8b5cf6', label: 'Response Time' },
    ],
    2: [
        { key: 'motor', color: '#10b981', label: 'Motor Skills' },
        { key: 'attention', color: '#3b82f6', label: 'Attention' },
        { key: 'daily', color: '#f59e0b', label: 'Daily Tasks' },
    ],
    3: [
        { key: 'social', color: '#ec4899', label: 'Social' },
        { key: 'emotional', color: '#8b5cf6', label: 'Emotional' },
        { key: 'routine', color: '#3b82f6', label: 'Routine' },
    ],
};

// ─── Session Logs ────────────────────────────────────────
const sessionLogs: Record<number, SessionLog[]> = {
    1: [
        {
            id: 1,
            date: '2026-02-10',
            summary: 'Vowel repetition and picture-word matching',
            improvement: 'Improved',
            notes: 'Rabia correctly identified 7 out of 10 picture cards today (up from 5 last session). Eye contact was maintained for 8 seconds during name-calling drills. Slight frustration during vowel "O" repetition; responded well to sensory break with fidget toy.',
        },
        {
            id: 2,
            date: '2026-02-07',
            summary: 'Name response and articulation drills',
            improvement: 'Improved',
            notes: 'Consistent response when name was called from 3 meters distance. Articulation of "ba", "ma", "da" syllables improved. Started combining two syllables spontaneously ("mama").',
        },
        {
            id: 3,
            date: '2026-02-03',
            summary: 'Receptive language and storytelling',
            improvement: 'Same',
            notes: 'Receptive language remained at a similar level. Rabia followed 2-step instructions with visual support. Storytelling with picture book showed interest but limited verbal output. Recommend continuing with increased visual supports.',
        },
        {
            id: 4,
            date: '2026-01-31',
            summary: 'Vowel sounds and turn-taking communication',
            improvement: 'Needs Attention',
            notes: 'Rabia appeared fatigued today. Struggled with vowel sounds beyond "a" and "e". Turn-taking communication game was abandoned after 5 minutes due to distress. Parent reports poor sleep this week. Will adjust intensity next session.',
        },
    ],
    2: [
        {
            id: 1,
            date: '2026-02-09',
            summary: 'Bead stringing and block stacking',
            improvement: 'Improved',
            notes: 'Amman completed bead stringing (5 beads) with minimal hand-over-hand support for the first time. Block stacking reached tower of 5 independently. Pincer grasp is strengthening noticeably. Voluntarily engaged without prompting.',
        },
        {
            id: 2,
            date: '2026-02-05',
            summary: 'Sensory play and adaptive skills',
            improvement: 'Same',
            notes: 'Sensory bin exploration was within expected range. Amman tolerated wet textures for 3 minutes (same as last session). Attempted spoon scooping during adaptive skills – inconsistent grip. Will continue with thicker-handled utensils.',
        },
        {
            id: 3,
            date: '2026-02-02',
            summary: 'Color matching and drawing',
            improvement: 'Improved',
            notes: 'Color matching was 100% accurate for primary colors (red, blue, yellow). Crayon grip transitioning from palmar to tripod with support. Drew circular scribbles with intent – showing early pre-writing readiness.',
        },
    ],
    3: [
        {
            id: 1,
            date: '2026-02-08',
            summary: 'Turn-taking and emotion recognition',
            improvement: 'Needs Attention',
            notes: 'Ahmed left the turn-taking activity twice, requiring physical redirection. However, showed interest in emotion flashcards and correctly identified "happy" and "sad" faces. Joint attention improved when paired with musical cue support.',
        },
        {
            id: 2,
            date: '2026-02-04',
            summary: 'Visual schedule and social story',
            improvement: 'Improved',
            notes: 'First session following full visual schedule with only 1 deviation. Social story about "waiting my turn" was engaged with – Ahmed pointed to pictures spontaneously. ABA reinforcement tokens were effective for sustained attention (4 minutes).',
        },
        {
            id: 3,
            date: '2026-01-30',
            summary: 'Joint attention and routine practice',
            improvement: 'Same',
            notes: 'Joint attention exercise showed minimal change. Ahmed made brief eye contact during peek-a-boo (2-3 seconds). Morning routine sequence cards were introduced – showed confusion with 3-step sequences. Will simplify to 2-step sequences.',
        },
    ],
};

// ─── Milestones ──────────────────────────────────────────
const milestones: Record<number, Milestone[]> = {
    1: [
        { id: 1, title: 'Responds to own name consistently', description: 'Child turns/looks when name is called from 3+ meters in 8/10 trials', status: 'Achieved', targetDate: '2026-01-15' },
        { id: 2, title: 'Uses 10+ single words meaningfully', description: 'Spontaneously uses at least 10 different words in context', status: 'In Progress', targetDate: '2026-03-01' },
        { id: 3, title: 'Combines two words together', description: 'Produces 2-word phrases like "more juice" or "mama come"', status: 'In Progress', targetDate: '2026-04-01' },
        { id: 4, title: 'Follows 2-step verbal instructions', description: 'Follows directions like "pick up the ball and bring it to me" without gesture cues', status: 'Not Started', targetDate: '2026-05-01' },
    ],
    2: [
        { id: 1, title: 'Stacks 5 blocks independently', description: 'Builds a tower of 5 blocks without assistance', status: 'Achieved', targetDate: '2026-01-20' },
        { id: 2, title: 'Uses spoon for self-feeding', description: 'Scoops food with spoon and brings to mouth with minimal spilling', status: 'In Progress', targetDate: '2026-03-15' },
        { id: 3, title: 'Strings 8 large beads', description: 'Threads beads onto a string using pincer grasp', status: 'In Progress', targetDate: '2026-03-01' },
        { id: 4, title: 'Scissors – single snip', description: 'Opens and closes scissors to make one cut on paper', status: 'Not Started', targetDate: '2026-05-01' },
    ],
    3: [
        { id: 1, title: 'Makes eye contact for 3 seconds', description: 'Maintains eye contact during interaction for at least 3 seconds', status: 'Achieved', targetDate: '2026-01-10' },
        { id: 2, title: 'Identifies 3 basic emotions', description: 'Points to correct emotion flashcard (happy, sad, angry) in 8/10 trials', status: 'In Progress', targetDate: '2026-03-01' },
        { id: 3, title: 'Waits for turn with visual timer', description: 'Waits for 1 minute using a visual countdown timer during structured play', status: 'Not Started', targetDate: '2026-04-01' },
        { id: 4, title: 'Follows 3-step morning routine', description: 'Follows visual schedule: wash hands → sit at table → eat breakfast', status: 'Not Started', targetDate: '2026-05-15' },
    ],
};

// ─── Helpers ─────────────────────────────────────────────
const improvementBadge: Record<string, { color: string; icon: React.ReactNode }> = {
    Improved: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    },
    Same: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <ArrowRight className="w-3.5 h-3.5" />,
    },
    'Needs Attention': {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
};

const milestoneStatus: Record<string, { color: string; bg: string }> = {
    Achieved: { color: 'text-green-700', bg: 'bg-green-100 border-green-200' },
    'In Progress': { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
    'Not Started': { color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200' },
};

const therapyColors: Record<string, string> = {
    'Speech Therapy': 'border-l-blue-500',
    'Occupational Therapy': 'border-l-emerald-500',
    'Behavioral Therapy': 'border-l-amber-500',
};

const metricColorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    pink: 'bg-pink-100 text-pink-600',
};

const progressBarColors: Record<string, string> = {
    blue: '[&>div]:bg-blue-500',
    emerald: '[&>div]:bg-emerald-500',
    purple: '[&>div]:bg-purple-500',
    amber: '[&>div]:bg-amber-500',
    pink: '[&>div]:bg-pink-500',
};

// ─── Component ───────────────────────────────────────────
export function TherapistProgress() {
    const [selectedChild, setSelectedChild] = useState<Child>(children[0]);

    const metrics = metricsData[selectedChild.id] || [];
    const chartData = weeklyProgress[selectedChild.id] || [];
    const lines = chartLines[selectedChild.id] || [];
    const logs = sessionLogs[selectedChild.id] || [];
    const childMilestones = milestones[selectedChild.id] || [];

    return (
        <motion.div
            className="max-w-7xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header */}
            <div>
                <h2 className="text-purple-600 text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Progress Tracking
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Monitor therapy-specific progress, view session logs, and track developmental milestones
                </p>
            </div>

            {/* Child Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {children.map((child) => {
                    const isActive = selectedChild.id === child.id;
                    return (
                        <motion.div key={child.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Card
                                onClick={() => setSelectedChild(child)}
                                className={`cursor-pointer transition-all border-l-4 ${therapyColors[child.therapyType]} ${isActive ? 'ring-2 ring-purple-400 shadow-lg' : 'hover:shadow-md'
                                    }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                                                }`}
                                        >
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{child.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {child.age} yrs • {child.therapyType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Overall Progress</span>
                                            <span>{child.overallProgress}%</span>
                                        </div>
                                        <Progress value={child.overallProgress} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* ─── Selected Child Progress ──────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedChild.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                >
                    {/* Therapy-Specific Metrics */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            {selectedChild.therapyType} Metrics — {selectedChild.name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {metrics.map((metric) => {
                                const change = metric.value - metric.previousValue;
                                return (
                                    <Card key={metric.label} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${metricColorMap[metric.color]}`}>
                                                    {metric.icon}
                                                </div>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                    <ArrowUpRight className="w-3 h-3 mr-0.5" />+{change}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}%</p>
                                            <Progress value={metric.value} className={`h-2 mt-3 ${progressBarColors[metric.color]}`} />
                                            <p className="text-xs text-gray-400 mt-2">Previous: {metric.previousValue}%</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-500" />
                                Weekly Progress Over 8 Weeks
                            </CardTitle>
                            <CardDescription>
                                Tracking {selectedChild.therapyType.toLowerCase()} metrics week-over-week for {selectedChild.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            {lines.map((line) => (
                                                <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={line.color} stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                            }}
                                        />
                                        <Legend />
                                        {lines.map((line) => (
                                            <Area
                                                key={line.key}
                                                type="monotone"
                                                dataKey={line.key}
                                                name={line.label}
                                                stroke={line.color}
                                                strokeWidth={2}
                                                fill={`url(#gradient-${line.key})`}
                                                dot={{ r: 4, strokeWidth: 2 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Grid: Session Logs + Milestones */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Session Progress Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                    Session Progress Logs
                                </CardTitle>
                                <CardDescription>Therapist notes from recent sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                                {logs.map((log) => {
                                    const badge = improvementBadge[log.improvement];
                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="border rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <Badge variant="outline" className={badge.color}>
                                                    <span className="flex items-center gap-1">
                                                        {badge.icon}
                                                        {log.improvement}
                                                    </span>
                                                </Badge>
                                            </div>
                                            <p className="font-medium text-gray-800 text-sm">{log.summary}</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">{log.notes}</p>
                                        </motion.div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Milestones */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-500" />
                                    Developmental Milestones
                                </CardTitle>
                                <CardDescription>Key goals for {selectedChild.name}'s therapy plan</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                                {childMilestones.map((milestone) => {
                                    const ms = milestoneStatus[milestone.status];
                                    return (
                                        <motion.div
                                            key={milestone.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`border rounded-lg p-4 space-y-2 ${ms.bg}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2">
                                                    {milestone.status === 'Achieved' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                                    ) : milestone.status === 'In Progress' ? (
                                                        <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Target className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className={`font-medium text-sm ${ms.color}`}>{milestone.title}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`text-xs shrink-0 ${ms.bg} ${ms.color}`}>
                                                    {milestone.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-400 ml-7">
                                                Target: {new Date(milestone.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
