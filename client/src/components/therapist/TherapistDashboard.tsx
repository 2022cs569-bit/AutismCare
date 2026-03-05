import { useState } from 'react';
import { Home, Users, ClipboardList, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { TherapistHome } from './TherapistHome';
import { TherapistClients } from './TherapistClients';
import { TherapyPlans } from './TherapyPlans';
import { TherapistSessions } from './TherapistSessions';
import { TherapistMessages } from './TherapistMessages';
import { TherapistProgress } from './TherapistProgress';

type Section = 'home' | 'clients' | 'plans' | 'progress' | 'sessions' | 'messages';

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  primaryRole: 'parent' | 'doctor' | 'therapist' | 'laboratory' | 'admin';
  roles: Array<'parent' | 'doctor' | 'therapist' | 'laboratory' | 'admin'>;
  email: string;
}

interface TherapistDashboardProps {
  user?: User; // optional, so we can render dummy for now
  onLogout: () => void;
}

const navigation = [
  { id: 'home', label: 'Dashboard', icon: Home, color: 'text-purple-600' },
  { id: 'clients', label: 'My Clients', icon: Users, color: 'text-purple-600' },
  { id: 'plans', label: 'Therapy Plans', icon: ClipboardList, color: 'text-purple-600' },
  { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, color: 'text-purple-600' },
  { id: 'sessions', label: ' Therapy Sessions', icon: Calendar, color: 'text-purple-600' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'text-purple-600' },
];

export function TherapistDashboard({ user, onLogout }: TherapistDashboardProps) {
  // Safe dummy user if none provided
  const safeUser: User = user ?? {
    _id: '1',
    firstName: 'Rabia',
    lastName: 'Babar',
    email: 'rabiababar@example.com',
    primaryRole: 'therapist',
    roles: ['therapist'],
  };

  const [currentSection, setCurrentSection] = useState<Section>('home');

  // Generate fullName and initials safely
  const fullName = `${safeUser.firstName || ''} ${safeUser.lastName || ''}`.trim();
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'JD';

  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section as Section);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <TherapistHome onNavigate={handleNavigate} />;
      case 'clients':
        return <TherapistClients />;
      case 'plans':
        return <TherapyPlans />;
      case 'progress':
        return <TherapistProgress />;
      case 'sessions':
        return <TherapistSessions />;
      case 'messages':
        return <TherapistMessages />;
      default:
        return <TherapistHome onNavigate={handleNavigate} />;
    }

  };

  return (
    <DashboardLayout
      navigation={navigation}
      currentSection={currentSection}
      onSectionChange={(section: string) => setCurrentSection(section as Section)}
      onLogout={onLogout}
      title="Therapist Dashboard"
    >
      {renderSection()}
    </DashboardLayout>
  );
}
