// Handler for confirmation dialog - to be integrated into page.tsx

export const handleConfirmPatch = async (
  pendingRequest: string,
  generatePlainLanguagePatch: any,
  setMessages: any,
  setSelectedPatchId: any,
  setShowConfirmation: any,
  setInterpretedRequest: any,
  setPendingRequest: any
) => {
  try {
    // Step 2: User confirmed, generate patch with skipConfirmation=true
    const result = await generatePlainLanguagePatch.mutateAsync({
      request: pendingRequest,
      skipConfirmation: true,
    });

    if (result.success && result.patch) {
      const patchData = result.patch;
      
      // Build detailed message content
      let messageContent = '**Patch Generated Successfully** (Plain-Language Mode)\n\n';
      
      if (patchData.summary) {
        messageContent += `${patchData.summary}\n\n`;
      }
      
      if (patchData.description) {
        messageContent += `${patchData.description}\n\n`;
      }
      
      if (patchData.files && patchData.files.length > 0) {
        messageContent += '**Files to be modified:** ' + patchData.files.length + '\n';
        messageContent += patchData.files.map((f: any) => `• ${f.path} (${f.action})`).join('\n');
        messageContent += '\n\n';
      }
      
      if (patchData.testingSteps && patchData.testingSteps.length > 0) {
        messageContent += '**Testing Steps:**\n';
        messageContent += patchData.testingSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
        messageContent += '\n\n';
      }
      
      if (patchData.risks && patchData.risks.length > 0) {
        messageContent += '**Risks:**\n';
        messageContent += patchData.risks.map((r: string) => `⚠️ ${r}`).join('\n');
        messageContent += '\n\n';
      }
      
      messageContent += `**Patch ID:** ${patchData.id}\n\n`;
      messageContent += 'Use the "Apply Patch" button to apply these changes.';

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: messageContent,
        timestamp: new Date(),
        patchId: patchData.id,
        status: 'pending' as const,
      };
      
      setMessages((prev: any[]) => [...prev, assistantMessage]);
      setSelectedPatchId(patchData.id);
    }

    // Close dialog
    setShowConfirmation(false);
    setInterpretedRequest(null);
    setPendingRequest('');
  } catch (error) {
    console.error('Failed to generate patch:', error);
    
    // Show error message
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: `**Error generating patch:** ${error}`,
      timestamp: new Date(),
    };
    
    setMessages((prev: any[]) => [...prev, errorMessage]);
    
    // Close dialog
    setShowConfirmation(false);
    setInterpretedRequest(null);
    setPendingRequest('');
  }
};

export const handleCancelConfirmation = (
  setShowConfirmation: any,
  setInterpretedRequest: any,
  setPendingRequest: any
) => {
  setShowConfirmation(false);
  setInterpretedRequest(null);
  setPendingRequest('');
};
