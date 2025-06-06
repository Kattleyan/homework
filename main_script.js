let wordList = [];
let currentWord = null;
let currentVersion = "A"; // A表示未显示释义，B表示已显示释义

//背单词功能
async function loadwords() {
    try {
        const response = await fetch('https://Kattleyan.github.io/homework/cet6_words.json');
        const rawWords = await response.json();
        //初始化单词状态
        wordList = rawWords.map(word => {
            const stats = JSON.parse(localStorage.getItem(word.word)) || { shown: 0, wrong: 0 };
            return { ...word, ...stats };
        });

        shownextword();
    } catch (error) {
        document.getElementById('word').innerText = '单词加载失败';
        console.error("加载单词出错：", error);
    }
}

function shownextword() {
    const ε = 0.1;
    let selected;
    const knownWords = wordList.filter(word => word.shown > 0);
    const avgScore = knownWords.length > 0
        ? knownWords.reduce((sum, word) =>
            sum + word.difficulty * (1 - word.wrong / word.shown), 0) / knownWords.length
        : 0;

    if (Math.random() < ε || knownWords.length === 0) {
        // 小概率随机探索
        selected = wordList[Math.floor(Math.random() * wordList.length)];
    } else {
        // 大概率根据掌握程度选与得分接近的词
        const candidates = wordList.filter(word =>
            Math.abs(word.difficulty - avgScore) <= 2
        );

        if (candidates.length > 0) {
            selected = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            selected = wordList[Math.floor(Math.random() * wordList.length)];
        }
    }

    currentWord = selected;
    document.getElementById('word').innerText = selected.word;
    document.getElementById('meaning').innerText = '';
    document.getElementById('hint').innerText = '我认识 (按 E)      |      我不认识 (按 Q)';
    currentVersion = "A";
}

document.addEventListener("keydown", function(event) {
    if (!currentWord) return;

    // Version A：用户看到单词，还没按键显示释义
    if (currentVersion === "A") {
        if (event.key === "e" || event.key === "E") {
            currentWord.shown += 1;
            document.getElementById('meaning').innerText = currentWord.meaning;
            currentVersion = "B";
            document.getElementById('hint').innerText = '我记错了 (按 W)      |      继续 (按 Space)';
        }
        if (event.key === "q" || event.key === "Q") {
            currentWord.shown += 1;
            currentWord.wrong += 1;
            document.getElementById('meaning').innerText = currentWord.meaning;
            currentVersion = "B";
            document.getElementById('hint').innerText = '继续 (按 Space)'; // 如果一开始就不认识，直接继续
        }
    }

    // Version B：释义已显示，准备进入下一个词
    else if (currentVersion === "B") {
        if (event.key === " " || event.key === "w" || event.key === "W") {
            if (event.key === "w" || event.key === "W") {
                currentWord.wrong += 1;
            }

            localStorage.setItem(currentWord.word, JSON.stringify({
                shown: currentWord.shown,
                wrong: currentWord.wrong
            }));

            shownextword();
        }
    }
});

//每日一句功能
async function loadDailyQuote() {
    try {
        const response = await fetch('https://Kattleyan.github.io/homework/daily_quotes.json');
        const quotes = await response.json();
        const today = new Date();
        const index = today.getDate() % quotes.length;
        document.getElementById("daily-quote").innerText = `每日一句：${quotes[index].content}`;
    } catch (error) {
        document.getElementById("daily-quote").innerText = '每日一句加载失败。';
        console.error("加载每日一句出错：", error);
    }
}

// 初始化
loadwords();
loadDailyQuote();

