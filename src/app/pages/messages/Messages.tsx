import { MessagesCenter } from '../../components/messages/MessagesCenter';

export function Messages() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-accent/20 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <MessagesCenter />
      </div>
    </div>
  );
}

export default Messages;
