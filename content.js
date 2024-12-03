// Function to summarize text (placeholder - replace with your actual summarization logic)
async function summarizeText(text) {
    const canSummarize = await ai.summarizer.capabilities();
    let summarizer;
    text += "Summarize the below content in under 100 characters- \n"
    let result = "";
    if (canSummarize && canSummarize.available !== 'no') {
    if (canSummarize.available === 'readily') {
        // The summarizer can immediately be used.
        summarizer = await ai.summarizer.create();
        result = await summarizer.summarize(text);

    } else {
        // The summarizer can be used after the model download.
        summarizer = await ai.summarizer.create();
        summarizer.addEventListener('downloadprogress', (e) => {
        console.log(e.loaded, e.total);
        });
        await summarizer.ready;
        result = await summarizer.summarize(text);

    }
    } else {
        // The summarizer can't be used at all.
        result = "Cannot summarize tweet right now"
    }
    return result

  }
  // function to generate relevant hashtags from text context
  async function generateHashtags(text){
    const writer = await ai.writer.create({
      sharedContext: "I want to tweet."
      });
      const result = await writer.write(
        "Give relevant hashtags for the following tweet. Give it in an array format- "+text)
    return result
  }

  // function to translate text to a preferred language (right now spanish)
  async function translateText(text){
    const translator = await self.ai.translator.create({sourceLanguage: 'en', targetLanguage: 'es'});
    const result = await translator.translate(text);
    return result;
  }

  // Create a loading spinner element
function createLoadingSpinner() {
  const spinnerContainer = document.createElement('div');
  spinnerContainer.id = 'tweet-summarizer-loader';
  spinnerContainer.style.position = 'fixed';
  spinnerContainer.style.top = '0';
  spinnerContainer.style.left = '0';
  spinnerContainer.style.width = '100%';
  spinnerContainer.style.height = '100%';
  spinnerContainer.style.display = 'flex';
  spinnerContainer.style.justifyContent = 'center';
  spinnerContainer.style.alignItems = 'center';
  spinnerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  spinnerContainer.style.zIndex = '9999';

  const spinner = document.createElement('div');
  spinner.style.width = '50px';
  spinner.style.height = '50px';
  spinner.style.border = '5px solid #f3f3f3';
  spinner.style.borderTop = '5px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'spin 1s linear infinite';

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  spinnerContainer.appendChild(spinner);
  document.body.appendChild(spinnerContainer);
  document.head.appendChild(styleSheet);

  return spinnerContainer;
}

// Remove the loading spinner
function removeLoadingSpinner(spinnerContainer) {
  if (spinnerContainer && spinnerContainer.parentNode) {
    spinnerContainer.parentNode.removeChild(spinnerContainer);
  }
}

function showProcessedText(summary){
  const summaryDiv = document.createElement('div');
  summaryDiv.style.position = 'absolute';
  summaryDiv.style.color = 'black';
  summaryDiv.style.background = 'white';
  summaryDiv.style.border = '1px solid black';
  summaryDiv.style.padding = '10px';
  summaryDiv.style.zIndex = '1000';
  summaryDiv.style.maxWidth = '300px';
        
  // Position the div 
  
    summaryDiv.style.left = `100px`;
    summaryDiv.style.top = `100px`;
        
  summaryDiv.textContent = summary;
  document.body.appendChild(summaryDiv);

   // Remove the div when clicking outside
   document.addEventListener('click', function removeDiv(e) {
    if (!summaryDiv.contains(e.target)) {
      document.body.removeChild(summaryDiv);
      document.removeEventListener('click', removeDiv);
    }
  });
}
  // Function to find and replace tweet text
function replaceTweetText(summary,type) {
    // Find the span with data-offset-key that contains the tweet text
    const tweetSpans = document.querySelectorAll('span[data-offset-key]');
    
    for (const span of tweetSpans) {
      // Check if this span is in the tweet composition area
      const tweetComposer = span.closest('[role="textbox"]');
      if (tweetComposer) {
        // If span contains a br or another span, replace its content
        const existingContent = span.querySelector('br, span');
        if (existingContent && type!="hashtags") {
          // Create a new span to replace the existing content
          existingContent.textContent = "";
          const newTextSpan = document.createElement('span');
          // Format result based on type
          newTextSpan.textContent = summary;
          
          // Copy over attributes to maintain styling
          for (const attr of existingContent.attributes) {
            newTextSpan.setAttribute(attr.name, attr.value);
          }
          
          // Replace the existing content
          existingContent.parentNode.replaceChild(newTextSpan, existingContent);
          
          break; // Stop after finding and replacing the first tweet text span
        }
        else{
          existingContent.textContent += summary
        }
      }
    }
  }
  
  const createErrorMsg = (msg) =>{
    const errorDiv = document.createElement('div');
        errorDiv.textContent = msg;
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.zIndex = '9999';
        document.body.appendChild(errorDiv);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(errorDiv);
        }, 3000);
  }
  // Listen for messages from the background script
 const  listenMessagesFromBackgroundScript = (request, sender, sendResponse) =>{
    if (request.action === "rewrite") {
        const selectedText = request.selectedText;
        
        // Show loading spinner
      const spinnerContainer = createLoadingSpinner();
        
        // Summarize the text
        summarizeText(selectedText)
          .then(summary => {
            // Remove loading spinner
            removeLoadingSpinner(spinnerContainer);
            //replaceTweetText(summary, 'summary');
            showProcessedText(summary);
          })
          .catch(error => {
            // Remove loading spinner on error
        removeLoadingSpinner(spinnerContainer);
        console.error('Summarization error:', error);
        
        // Show error message to user
        createErrorMsg("Failed to summarize the tweet :(")
        
          });
      }
      if (request.action === "generate-hashtags") {
        const selectedText = request.selectedText;
        const spinnerContainer = createLoadingSpinner();
        
        generateHashtags(selectedText)
          .then(hashtags => {
            removeLoadingSpinner(spinnerContainer);
            //replaceTweetText(hashtags, 'hashtags');
            showProcessedText(hashtags);
          })
          .catch(error => {
            removeLoadingSpinner(spinnerContainer);
            console.error('Hashtag generation error:', error);

            // Show error message to user
        createErrorMsg("Failed to generate hash tags for your tweet :(")
          });
      }
      if (request.action === "translate-text") {
        const selectedText = request.selectedText;
        const spinnerContainer = createLoadingSpinner();
        
        translateText(selectedText)
          .then(translatedText => {
            removeLoadingSpinner(spinnerContainer);
            //replaceTweetText(translatedText, 'translation');
            showProcessedText(translatedText);
          })
          .catch(error => {
            removeLoadingSpinner(spinnerContainer);
            console.error('Translation error:', error);

            // Show error message to user
        createErrorMsg("Failed to translate your tweet :(")
          });
      }
 }
chrome.runtime.onMessage.addListener(listenMessagesFromBackgroundScript);