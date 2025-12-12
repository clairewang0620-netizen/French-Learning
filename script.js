// 单词数据
const words = [
    { word: "Bonjour", meaning: "你好" },
    { word: "Merci", meaning: "谢谢" },
    { word: "Au revoir", meaning: "再见" }
];

// 显示单词列表
function showWordList() {
    const list = document.getElementById("wordList");
    const flash = document.getElementById("flashCard");
    flash.classList.add("hidden");
    list.classList.remove("hidden");

    list.innerHTML = "";
    words.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item.word;
        li.className = "cursor-pointer p-2 rounded hover:bg-blue-100";
        li.onclick = () => showFlashCard(index);
        list.appendChild(li);
    });
}

// 显示 flash card
function showFlashCard(index) {
    const flash = document.getElementById("flashCard");
    const list = document.getElementById("wordList");
    list.classList.add("hidden");
    flash.classList.remove("hidden");

    flash.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${words[index].word}</h2>
        <p class="text-gray-700 mb-4">${words[index].meaning}</p>
        <button class="bg-blue-500 text-white px-4 py-2 rounded mr-2" onclick="speakWord('${words[index].word}')">🔊 发音</button>
        <button class="bg-gray-300 px-4 py-2 rounded" onclick="showWordList()">返回列表</button>
    `;
}

// Web Speech API 发音
function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'fr-FR'; // 法语
        window.speechSynthesis.speak(utterance);
    } else {
        alert("你的浏览器不支持语音播放");
    }
}

// 初始化
document.addEventListener("DOMContentLoaded", showWordList);
