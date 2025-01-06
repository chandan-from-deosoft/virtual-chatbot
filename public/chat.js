// Select chatbot elements
let chatBot = document.getElementById("chat-bot");
let chatBotImg = chatBot.querySelector("img.chat-bot-img");
let chatBotWrapper = chatBot.querySelector(".chat-bot-wrapper");

const chatMessageContainer = document.querySelector(".chat-bot-chat");
const nameInput = document.querySelector(".name-input");
const submitNameBtn = document.querySelector(".submit-btn");
const mainMenuBtn = document.querySelector(".footer-main-menu");
const inputField = document.getElementById("input-a name-input");

// Add click event listener to the chatbot image
chatBotImg.addEventListener("click", () => {
  // Hide the chatbot image and display the chatbot wrapper
  chatBotImg.style.display = "none";
  chatBotWrapper.style.display = "flex";

  // Add functionality to the close button
  let chatBotCloseBtn = document.getElementById("chat-bot-close-btn");
  chatBotCloseBtn.addEventListener("click", () => {
    // Show the chatbot image and hide the chatbot wrapper
    chatBotImg.style.display = "block";
    chatBotWrapper.style.display = "none";
  });
});

function addMessage(message, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-bot-chat-msg ${isUser ? "right" : "left"}`;
  messageDiv.textContent = message;
  //messageDiv.innerHTML = `<pre>${message}</pre>`;

  chatMessageContainer.appendChild(messageDiv);
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;

  nameInput.disabled = false;
  submitNameBtn.disabled = false;
}

async function showOptions(options) {
  if (!Array.isArray(options)) {
    console.error("Invalid options data:", options);
    return;
  }

  nameInput.disabled = true;
  submitNameBtn.disabled = true;

  const optContainer = document.createElement("div");
  optContainer.className = "chat-bot-chat-options";
  for (const option of options) {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = option.text;

    button.onclick = async () => {
      addMessage(option.text, true);

      const nextState = option.next;
      const [nextMessage] = await getChatReplyMessage(nextState);

      if (nextMessage) {
        setTimeout(() => {
          addMessage(nextMessage.message);
        }, 1000);

        const nextOptions = await getChatReplyOptions(nextState);
        if (nextOptions.length) showOptions(nextOptions);
      }
    };

    optContainer.appendChild(button);
  }
  chatMessageContainer.appendChild(optContainer);
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
}

//change

submitNameBtn.addEventListener("click", async () => {
  const inputValue = nameInput.value.trim();
  submitNameBtn.disabled = true;
  nameInput.value = ""; // Clear the input field

  if (inputValue) {
    // Check if input is numeric to determine if it's an appointment ID
    if (!isNaN(inputValue)) {
      addMessage(`Fetching status for Appointment ID: ${inputValue}`, true);

      const result = await getAppointmentStatus(inputValue);

      if (result.error) {
        addMessage(`Error: ${result.error}`);
      } else {
        addMessage(`Appointment Details: 
        - ID: ${result.appointment_id} 
        - Patient: ${result.patient_name} 
        - Doctor: ${result.doctor_name} 
        - Date: ${result.appointment_date} 
        - Time: ${result.appointment_time} 
        - Status: ${result.status}`);
      }
      setTimeout(async () => {
        await getChatReplyMessage(4).then(async (data) => {
          let mainMenuMessage = data[0];
          await getChatReplyOptions(4).then((data) => {
            let mainMenuOptions = data;
            addMessage(mainMenuMessage.message);
            showOptions(mainMenuOptions);
          });
        });
      }, 4000);
    } else {
      // If input is not numeric, treat it as a name
      addMessage(`${inputValue}`, true);
      addMessage(`Hello ${inputValue}! Nice to meet you.`);

      await getChatReplyMessage(4).then(async (data) => {
        let mainMenuMessage = data[0];
        await getChatReplyOptions(4).then((data) => {
          let mainMenuOptions = data;
          addMessage(mainMenuMessage.message);
          showOptions(mainMenuOptions);
        });
      });
    }
  }
});

async function getChatReplyMessage(chatId) {
  return await fetch(`http://localhost:3000/chats/message/get/${chatId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      return Array.isArray(data) ? data : [data];
    }) // Ensure the data is an array
    .catch((error) => console.error("Error fetching data:", error));
}

async function getChatReplyOptions(chatId) {
  return await fetch(`http://localhost:3000/chats/options/get/${chatId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    }) // Ensure the data is an array
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Initialization
// getChatReplyMessage(1).then(function (data) {
//   addMessage(data[0].message);
//   getChatReplyOptions(1).then(function (data) {
//     showOptions(data);
//   });
// });

getChatReplyMessage(1).then(function (data) {
  const message = data[0].message;
  addMessage(message);

  // Enable the send button and input field based on a condition

  if (message && message.length > 0) {
    submitNameBtn.disabled = false;
    inputField.disabled = false;
  } else {
    sendBtn.disabled = true;
    inputField.disabled = true;
  }

  getChatReplyOptions(1).then(function (data) {
    showOptions(data);
  });
});

mainMenuBtn.addEventListener("click", async () => {
  // chatMessageContainer.innerHTML = "";
  await getChatReplyMessage(4).then(async (data) => {
    let mainMenuMessage = data[0];
    await getChatReplyOptions(4).then((data) => {
      let mainMenuOptions = data;
      addMessage(mainMenuMessage.message);
      showOptions(mainMenuOptions);
    });
  });
});

//appointment status
async function getAppointmentStatus(appointmentId) {
  return await fetch("http://localhost:3000/appointment-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appointment_id: appointmentId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Failed to fetch appointment status: " + response.statusText
        );
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching appointment status:", error);
      return { error: error.message };
    });
}
