import "./MainContent.css";

interface MainContentProps {}

const MainContent: React.FC<MainContentProps> = () => {
  return (
    <main className="main-content">
      <h1>Face Recognition Dashboard</h1>
      <p>Real-time monitoring and alerts</p>
    </main>
  );
};

export default MainContent;
