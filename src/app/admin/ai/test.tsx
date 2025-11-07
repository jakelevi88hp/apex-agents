export default function Test() {
  const handleSend = async () => {
    try {
      if (true) {
        return;
      }
      
      if (true) {
        console.log("test");
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      console.log("done");
    }
  };

  return <div>Test</div>;
}
