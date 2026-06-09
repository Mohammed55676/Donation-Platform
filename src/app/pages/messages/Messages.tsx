import { useState } from 'react';
import { MessagesCenter } from '../../components/messages/MessagesCenter';
import { FindCharities } from '../../components/messages/FindCharities';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { MessageSquare, Building2 } from 'lucide-react';

export function Messages() {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-accent/20 py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl h-12 bg-muted/50 p-1">
              <TabsTrigger value="chats" className="rounded-lg gap-2 font-medium">
                <MessageSquare className="h-4 w-4" />
                المحادثات
              </TabsTrigger>
              <TabsTrigger value="find" className="rounded-lg gap-2 font-medium">
                <Building2 className="h-4 w-4" />
                البحث عن جمعيات
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chats" className="mt-0 outline-none">
            <MessagesCenter />
          </TabsContent>
          
          <TabsContent value="find" className="mt-0 outline-none">
            <FindCharities />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Messages;
