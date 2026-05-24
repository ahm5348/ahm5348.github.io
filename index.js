// Upchurzzle v3

(async function()  {
    // take elements from HTML
    const songsel = document.getElementById('songsel');
    const submit = document.getElementById('submit');
    const change_answer = document.getElementById('change_answer');
    const seeanswer = document.getElementById('seeanswer');
    const answer_text = document.getElementById('answer_text');
    const guesses = document.getElementById('guesses');
    const answer_div = document.getElementById('answer');

    // Load songs
    let songs = [];
    try {
        const response = await fetch('./data/songs.json');
        songs = await response.json();

    } catch (e) {
        console.log(e);
        return;
    }

    // Create a list of song titles from the list
    const titles = Array.from(new Set(songs.map(s => s.title))).sort();
    titles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        option.text = title;
        songsel.appendChild(option);
    })

    // set up guess number
    let guess_num = 0;

    // set up random song
    let answer = songs[Math.floor(Math.random() * songs.length)];
    // assert answer is a song?

    function check_album(actual_num, guess_num) {
        const diff = (actual_num - guess_num);
        if (diff === 0) {
            return {color: 'green', dir: null};
        } else if (Math.abs(diff) < 3) {
            return {color: 'yellow', dir: diff > 0 ? 'down' : 'up'};
        } else {
            return {color: 'gray', dir: null};
        }
    }

    function check_song(actual_num, guess_num) {
        const diff = (actual_num - guess_num);
        if (diff === 0) {
            return {color: 'green', dir: null};
        } else if (Math.abs(diff) < 3) {
            return {color: 'yellow', dir: diff > 0 ? 'down' : 'up'};
        } else {
            return {color: 'gray', dir: null};
        }
    }

    function check_length(actual_num, guess_num) {
        const diff = (actual_num - guess_num);
        if (diff === 0) {
            return {color: 'green', dir: null};
        } else if (Math.abs(diff) < 30) {
            return {color: 'yellow', dir: diff > 0 ? 'down' : 'up'};
        } else {
            return {color: 'gray', dir: null};
        }
    }

    function check_features(act_features, guess_features) {
        return { color: 'gray' };
    }

    function displayGuess(albumStatus, songStatus, guessObj) {
        const row = document.createElement('div');
        row.className = 'guessRow';

        const titleField = document.createElement('div');
        titleField.className = 'field';
        titleField.innerHTML = `<span class="label">Title:</span> ${guessObj.title}`;
        titleField.classList.add(songStatus.color);
        row.appendChild(titleField);

        const albumField = document.createElement('div');
        albumField.className = 'field';
        albumField.innerHTML = `<span class="label">Album: :</span> ${guessObj.album}`;
        albumField.classList.add(albumStatus.color);
        row.appendChild(albumField);

        const albumNumField = document.createElement('div');
        albumNumField.className = 'field';
        albumNumField.innerHTML = `<span class="label">Album #:</span> ${guessObj.albumNumber}`;
        albumNumField.classList.add(albumStatus.color);
        row.appendChild(albumNumField);

        const songNumField = document.createElement('div');
        songNumField.className = 'field';
        songNumField.innerHTML = `<span class="label">Track #:</span> ${guessObj.songNumber}`;
        songNumField.classList.add(songStatus.color);
        row.appendChild(songNumField);

        // stop here for now
        guesses.append(row);

    }

    change_answer.addEventListener('click', () => {
        answer = songs[Math.floor(Math.random() * songs.length)];   // needs to be changed
        answer_div.hidden = true;
    });

    submit.addEventListener('click', () => {
        const guess_title = songsel.value;
        const guess = songs.find(s => s.title === guess_title);
        if (!guess) {
            alert('Please select a valid song');
            return;
        }

        const songCmp = check_song(answer.songNumber, guess.songNumber);
        const albumCmp = check_album(answer.albumNumber, guess.albumNumber);
        // const lenCmp = check_length(answer.len, guess.len);

        displayGuess(albumCmp, songCmp, guess);

    });

    seeanswer.addEventListener('click', () => {
        answer_text.textContent = `${answer.title} on Album ${answer.album}`;
        answer_div.hidden = false;
    });

})();

