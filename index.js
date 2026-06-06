// Upchurzzle v3

(async function()  {
    // take elements from HTML
    const songsel = document.getElementById('songInput');
    const suggest = document.getElementById('suggestions');

    const seeanswer = document.getElementById('seeanswer');
    const submit = document.getElementById('submit');
    const change_answer = document.getElementById('change_answer');

    const answer_text = document.getElementById('answer_text');
    const guesses = document.getElementById('guesses');
    const answer_div = document.getElementById('answer');

    const arrows = document.getElementById('arrows');
    const length = document.getElementById('length');
    const colors = document.getElementById('colors');
    const features = document.getElementById('features');

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
    // const titles = Array.from(new Set(songs.map(s => s.title))).sort();
    // titles.forEach(title => {
    //     const option = document.createElement('option');
    //     option.value = title;
    //     option.text = title;
    //     // songsel.appendChild(option);
    // })

    const indexedSongs = songs.map((song, i) => ({
        title: song.title, index: i}));
    let selIndex = null;

    // set up guess number
    let guess_num = 0;

    // set up random song
    let answer = songs[Math.floor(Math.random() * songs.length)];


    /// Dropdown
    function filterSuggestions(input) {
        if (!input) return [];
        const lowerInput = input.trim().toLowerCase();
        return indexedSongs.filter(
            indexedSong => indexedSong.title.toLowerCase().startsWith(lowerInput));
    }

    function renderSuggestions(list) {
        // clear suggestions
        suggest.innerHTML = '';

        if (!list || list.length === 0) return;

        // show first 5 options
        const max = Math.min(list.length, 5);
        for (let i = 0; i < max; i++) {
            const indexedSong = list[i];
            const div = document.createElement('div');
            div.className = 'suggestion';
            div.dataset.index = indexedSong.index;
            // div.dataset.pos = i;
            div.innerHTML = indexedSong.title;
            div.addEventListener('click', (e) => {
                e.preventDefault(); // dont do anything extra, we are taking care of it!
                chooseSuggestion(div);
            });
            suggest.appendChild(div);
        }

        // reveal suggestions now
        suggest.hidden = false;
    }

    function chooseSuggestion(element) {
        const idx = parseInt(element.dataset.index, 10); // base 10
        songsel.value = songs[idx].title;
        // suggestions menu closed
        suggest.hidden = true;
    }

    songsel.addEventListener('input', (e) => {
        const text = songsel.value;
        const filtered = filterSuggestions(text);
        renderSuggestions(filtered);
    });


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

        const albumField = document.createElement('div');
        albumField.className = 'field';
        albumField.innerHTML = `${guessObj.album}`;
        if (colors.checked) {
            albumField.classList.add(albumStatus.color);
        }
        else {
            albumField.classList.add('gray');
        }
        row.appendChild(albumField);

        const titleField = document.createElement('div');
        titleField.className = 'field';
        titleField.innerHTML = `<span class="label">Title:</span> ${guessObj.title}`;
        if (colors.checked) {
            titleField.classList.add(songTitleStatus.color);
        }
        else {
            titleField.classList.add('gray');
        }
        row.appendChild(titleField);

        const albumNumField = document.createElement('div');
        albumNumField.className = 'field';
        if (arrows.checked) {
            albumNumField.innerHTML = `<span class="label">Album #:</span> ${guessObj.albumNumber}` + (albumStatus.dir ? ` ${albumStatus.dir}` : '');
        }
        else {
            albumNumField.innerHTML = `<span class="label">Album #:</span> ${guessObj.albumNumber}`;
        }
        if (colors.checked) {
            albumNumField.classList.add(albumStatus.color);
        }
        else {
            albumNumField.classList.add('gray');
        }
        row.appendChild(albumNumField);

        const songNumField = document.createElement('div');
        songNumField.className = 'field';
        if (arrows.checked) {
            songNumField.innerHTML = `<span class="label">Track #:</span> ${guessObj.songNumber}` + (songStatus.dir ? ` ${songStatus.dir}` : '');
        }
        else {
            songNumField.innerHTML = `<span class="label">Track #:</span> ${guessObj.songNumber}`;
        }
        if (colors.checked) {
            songNumField.classList.add(songStatus.color);
        }
        else {
            songNumField.classList.add('gray');
        }
        row.appendChild(songNumField);

        if (length.checked) {
            const min = Math.floor(guessObj.len / 60);
            const sec = guessObj.len % 60;
            const lenField = document.createElement('div');
            lenField.className = 'field';
            if (sec > 9) {
                if (arrows.checked) {
                    lenField.innerHTML = `<span class="label">Track Length:</span> ${min}:${sec}` + (lenStatus.dir ? ` ${lenStatus.dir}` : '');
                }
                else {
                    lenField.innerHTML = `<span class="label">Track Length:</span> ${min}:${sec}`;
                }
            }
            else {
                if (arrows.checked) {
                    lenField.innerHTML = `<span class="label">Track Length:</span> ${min}:0${sec}` + (lenStatus.dir ? ` ${lenStatus.dir}` : '');
                }
                else {
                    lenField.innerHTML = `<span class="label">Track Length:</span> ${min}:0${sec}`;
                }

            }
            if (colors.checked) {
                lenField.classList.add(lenStatus.color);
            }
            else {
                lenField.classList.add('gray');
            }
            row.appendChild(lenField);
        }

        if (features.checked) {
            const featureField = document.createElement('div');
            featureField.className = 'field';
            featureField.innerHTML = `<span class="label">Features:</span> ${guessObj.features}`;
            if (colors.checked) {
                featureField.classList.add(featureStatus.color);
            }
            else {
                featureField.classList.add('gray');
            }
            row.appendChild(featureField);
        }

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
        answer_text.textContent = `Song: ${answer.title} Album: ${answer.album}`;
        // make background for it green
        answer_div.hidden = false;
    });

})();

