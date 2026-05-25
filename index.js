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
            return {color: 'yellow', dir: diff > 0 ? '↑' : '↓'};
        } else {
            return {color: 'gray', dir: diff > 0 ? '↑' : '↓'};
        }
    }

    function check_song(actual_num, guess_num) {
        const diff = (actual_num - guess_num);
        if (diff === 0) {
            return {color: 'green', dir: null};
        } else if (Math.abs(diff) < 3) {
            return {color: 'yellow', dir: diff > 0 ? '↑' : '↓'};
        } else {
            return {color: 'gray', dir: diff > 0 ? '↑' : '↓'};
        }
    }

    function check_length(actual_num, guess_num) {
        const diff = (actual_num - guess_num);
        if (diff === 0) {
            return {color: 'green', dir: null};
        } else if (Math.abs(diff) < 30) {
            return {color: 'yellow', dir: diff > 0 ? '↑' : '↓'};
        } else {
            return {color: 'gray', dir: diff > 0 ? '↑' : '↓'};
        }
    }

    function check_features(act_features, guess_features) {
        // if all features match (and same length), green
        // if at least one matches, yellow
        // if none match, gray

        let i = 0
        for (let feature of guess_features) {
            if (act_features.includes(feature)) {
                i = i + 1;
            }
        }
        if (i >= 1 && i === act_features.length) {
            return {color: 'green'};
        }
        if (i === 0) {
            return {color: 'gray'};
        }
        else {
            return {color: 'yellow'};
        }
    }

    function displayGuess(albumStatus, songStatus, songTitleStatus, lenStatus, featureStatus, guessObj) {
        const row = document.createElement('div');
        row.className = 'guessRow';

        const titleField = document.createElement('div');
        titleField.className = 'field';
        titleField.innerHTML = `<span class="label">Title:</span> ${guessObj.title}`;
        titleField.classList.add(songTitleStatus.color);
        row.appendChild(titleField);

        const albumField = document.createElement('div');
        albumField.className = 'field';
        albumField.innerHTML = `<span class="label">Album:</span> ${guessObj.album}`;
        albumField.classList.add(albumStatus.color);
        row.appendChild(albumField);

        const albumNumField = document.createElement('div');
        albumNumField.className = 'field';
        albumNumField.innerHTML = `<span class="label">Album #:</span> ${guessObj.albumNumber}` + (albumStatus.dir ? ` ${albumStatus.dir}` : '');
        albumNumField.classList.add(albumStatus.color);
        row.appendChild(albumNumField);

        const songNumField = document.createElement('div');
        songNumField.className = 'field';
        songNumField.innerHTML = `<span class="label">Track #:</span> ${guessObj.songNumber}` + (songStatus.dir ? ` ${songStatus.dir}` : '');
        songNumField.classList.add(songStatus.color);
        row.appendChild(songNumField);

        // interpret time
        const min = Math.floor(guessObj.len / 60);
        const sec = guessObj.len % 60;

        const lenField = document.createElement('div');
        lenField.className = 'field';
        if (sec > 9) {
            lenField.innerHTML = `<span class="label">Track Length:</span> ${min}:${sec}` + (lenStatus.dir ? ` ${lenStatus.dir}` : '');
        }
        else {
            lenField.innerHTML = `<span class="label">Track Length:</span> ${min}:0${sec}` + (lenStatus.dir ? ` ${lenStatus.dir}` : '');
        }
        lenField.classList.add(lenStatus.color);
        row.appendChild(lenField);

        const featureField = document.createElement('div');
        featureField.className = 'field';
        featureField.innerHTML = `<span class="label">Features:</span> ${guessObj.features}`;
        featureField.classList.add(featureStatus.color);
        row.appendChild(featureField);

        // stop here for now
        guesses.append(row);

    }

    change_answer.addEventListener('click', () => {
        answer = songs[Math.floor(Math.random() * songs.length)];   // needs to be changed
        guesses.replaceChildren();
        guess_num = 0;
        answer_div.hidden = true; // ensure its hidden now even if it wasnt before
    });

    submit.addEventListener('click', () => {
        const guess_title = songsel.value;
        const guess = songs.find(s => s.title === guess_title);
        if (!guess) {
            alert('Please select a valid song');
            return;
        }
        if (guess_num > 7) {
            alert('Out of Guesses!');
            return;
        }
        guess_num++;

        const songCmp = check_song(answer.songNumber, guess.songNumber);
        const albumCmp = check_album(answer.albumNumber, guess.albumNumber);
        const lenCmp = check_length(answer.len, guess.len);
        const featureCmp = check_features(answer.features, guess.features);

        let songTitleCmp = songCmp;
        if (songCmp.color === 'green' && albumCmp.color !== 'green'){
            songTitleCmp = {color:'yellow', dir: songCmp.dir};
        }


        displayGuess(albumCmp, songCmp, songTitleCmp, lenCmp, featureCmp, guess);

    });

    seeanswer.addEventListener('click', () => {
        answer_text.textContent = `${answer.title} -- ${answer.album}`;
        answer_div.hidden = false;
    });

})();

