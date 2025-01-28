 // Select chatbot elements
 const chatBot = document.getElementById("chat-bot");
 const chatBotImg = chatBot.querySelector("img.chat-bot-img");
 const chatBotWrapper = chatBot.querySelector(".chat-bot-wrapper");
 const chatMessageContainer = document.querySelector(".chat-bot-chat");
 const nameInput = document.querySelector(".name-input");
 const submitNameBtn = document.querySelector(".submit-btn");
 const mainMenuBtn = document.querySelector(".footer-main-menu");

 // Add click event listener to the chatbot image
 chatBotImg.addEventListener("click", () => {
   // Hide the chatbot image and display the chatbot wrapper
   chatBotImg.style.display = "none";
   chatBotWrapper.style.display = "flex";

   // Add functionality to the close button
   const chatBotCloseBtn = document.getElementById("chat-bot-close-btn");
   chatBotCloseBtn.addEventListener("click", () => {
     // Show the chatbot image and hide the chatbot wrapper
     chatBotImg.style.display = "block";
     chatBotWrapper.style.display = "none";
   });
 });

 // Function to add a message to the chat
 function addMessage(message, isUser = false) {
   return new Promise((resolve) => {
     const messageDiv = document.createElement("div");
     messageDiv.className = `chat-bot-chat-msg ${isUser ? "right" : "left"}`;
     messageDiv.textContent = message;

     chatMessageContainer.appendChild(messageDiv);
     chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;

     nameInput.disabled = false;
     submitNameBtn.disabled = false;

     // Resolve the promise after the message is added
     resolve();
   });
 }

 // Function to show options
 async function showOptions(options) {
   if (!Array.isArray(options)) {
     console.error("Invalid options data:", options);
     return;
   }

   // Disable existing option buttons
   const existingButtons = chatMessageContainer.querySelectorAll(".option-button");
   existingButtons.forEach((button) => {
     button.disabled = true;
     button.style.opacity = "0.5";
     button.style.cursor = "not-allowed";
   });

   nameInput.disabled = true;
   submitNameBtn.disabled = true;

   const optContainer = document.createElement("div");
   optContainer.className = "chat-bot-chat-options";
   for (const option of options) {
     const button = document.createElement("button");
     button.className = "option-button";
     button.textContent = option.text;

     button.onclick = async () => {
       await addMessage(option.text, true);

       const nextState = option.next;
       const [nextMessage] = await getChatReplyMessage(nextState);

       if (nextMessage) {
         await addMessage(nextMessage.message);

         const nextOptions = await getChatReplyOptions(nextState);
         if (nextOptions.length) showOptions(nextOptions);
       }
     };

     optContainer.appendChild(button);
   }
   chatMessageContainer.appendChild(optContainer);
   chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
 }

 // Event listener for the send button
 submitNameBtn.addEventListener("click", async () => {
   const inputValue = nameInput.value.trim();
   
   submitNameBtn.style.cursor = "not-allowed";
   //submitNameBtn.disabled = true;
   nameInput.value = ""; // Clear the input field

   if (inputValue) {
     if (!isNaN(inputValue)) {
       // If input is numeric (appointment ID)
       await addMessage(`Fetching status for Appointment ID: ${inputValue}`, true);

       const result = await getAppointmentStatus(inputValue);

       if (result.error) {
         await addMessage(`Error: ${result.error}`);
       } else {
         await addMessage(`Appointment Details: 
         - ID: ${result.appointment_id} 
         - Patient: ${result.patient_name} 
         - Doctor: ${result.doctor_name} 
         - Date: ${result.appointment_date} 
         - Time: ${result.appointment_time} 
         - Status: ${result.status}`);
       }

     } else {
       // If input is not numeric (name)
       await addMessage(`${inputValue}`, true);
       await addMessage(`Hello ${inputValue}! Nice to meet you.`);

       // Fetch and display main menu options
       const [mainMenuMessage] = await getChatReplyMessage(4);
       await addMessage(mainMenuMessage.message);

       const mainMenuOptions = await getChatReplyOptions(4);
       showOptions(mainMenuOptions);
     }
   }
 });

 // Event listener for the main menu button
 mainMenuBtn.addEventListener("click", async () => {
   const [mainMenuMessage] = await getChatReplyMessage(4);
   await addMessage(mainMenuMessage.message);

   const mainMenuOptions = await getChatReplyOptions(4);
   showOptions(mainMenuOptions);
 });

 // Function to fetch chat reply message
 async function getChatReplyMessage(chatId) {
   return fetch(`http://localhost:3000/chats/message/get/${chatId}`)
     .then((response) => {
       if (!response.ok) {
         throw new Error("Network response was not ok " + response.statusText);
       }
       return response.json();
     })
     .then((data) => {
       return Array.isArray(data) ? data : [data];
     })
     .catch((error) => console.error("Error fetching data:", error));
 }

 // Function to fetch chat reply options
 async function getChatReplyOptions(chatId) {
   return fetch(`http://localhost:3000/chats/options/get/${chatId}`)
     .then((response) => {
       if (!response.ok) {
         throw new Error("Network response was not ok " + response.statusText);
       }
       return response.json();
     })
     .catch((error) => {
       console.error("Error fetching data:", error);
     });
 }

 // Function to fetch appointment status
 async function getAppointmentStatus(appointmentId) {
   return fetch(`http://localhost:3000/appointment-status?appointmentId=${appointmentId}`, {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
     },
   })
     .then((response) => {
       if (!response.ok) {
         throw new Error("Failed to fetch appointment status: " + response.statusText);
       }
       return response.json();
     })
     .catch((error) => {
       console.error("Error fetching appointment status:", error);
       return { error: error.message };
     });
 }

 // Initialization
 getChatReplyMessage(1).then(async (data) => {
   const message = data[0].message;
   await addMessage(message);

   const options = await getChatReplyOptions(1);
   showOptions(options);
 });