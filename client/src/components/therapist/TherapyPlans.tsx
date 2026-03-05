import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';


interface Template {
  id: number;
  name: string;
  category: string;
  duration: string;
  description: string;
  activities: { name: string; type: 'home' | 'center'; days: number }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function TherapyPlans() {
  const navigate = useNavigate();

  const templates: Template[] = [
    {
      id: 1,
      name: 'Speech Development - Level 1',
      category: 'Speech Therapy',
      duration: '12 weeks',
      description: 'Foundation speech therapy program for early intervention',
      activities: [
        { name: 'Vocal exercises', type: 'home', days: 5 },
        { name: 'Picture naming', type: 'center', days: 3 },
        { name: 'Storytelling Practice', type: 'home', days: 2 },
      ],
    },
    {
      id: 2,
      name: 'Social Skills Builder',
      category: 'Behavioral Therapy',
      duration: '8 weeks',
      description: 'Structured program to develop social interaction skills',
      activities: [
        { name: 'Role-playing', type: 'center', days: 3 },
        { name: 'Emotion Identification', type: 'home', days: 4 },
        { name: 'Daily Routine Tracking', type: 'center', days: 7 },
      ],
    },
    {
      id: 3,
      name: 'Occupational Skills Starter',
      category: 'Occupational Therapy',
      duration: '10 weeks',
      description: 'Early intervention for fine and gross motor skills',
      activities: [
        { name: 'Hand coordination Exercises', type: 'home', days: 5 },
        { name: 'Sensory Integration play', type: 'center', days: 3 },
         { name: 'Adaptive Skills Training', type: 'home', days: 4 },
      ],
    },
  ];

  const handleUseTemplate = (templateId: number) => {
    navigate(`/therapist/therapy-plan/${templateId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-purple-600 mb-2">Therapy Plans</h2>
          <p className="text-gray-600">Select templates or create custom therapy plans</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Plan
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {templates.map((template) => (
          <motion.div key={template.id} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-purple-600">{template.name}</CardTitle>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📅 {template.duration}</span>
                  <span>📋 {template.activities.length} activities</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
