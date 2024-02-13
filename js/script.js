console.log('Lets write JavaScript');

let currentSong = new Audio()
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`https://github.com/AkshayBhadule/Spotify-Clone/tree/main/songs/${folder}/`);
    // console.log(folder)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement('div');
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        //  In original code here width is 34 
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">     
         <div class="info">
             <div> ${song.replaceAll("%20", " ")} </div>
             <div>Akshay</div>
         </div>
         <div class="playnow">
             <span>Play Now</span>
             <img class="invert" src="img/play.svg" alt="">
         </div></li>`;
    }

    // Attach an event listener to each song 

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track); 
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00.00 / 00.00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]; // get the second last item to get the folder name
            // Get the metadata of folder
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML += ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill="none">
                        <path d="M5 20V4L19 12L5 20Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"
                            fill="#000" />
                    </svg>
                </div>

                <img src="songs/${folder}/cover.jpg" alt="poster">
                <h3>${response.title}</h3>
                <p>${response.description}</p>
            </div>`;
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.removeEventListener("click", cardClickHandler); // Remove existing event listener
        e.addEventListener("click", cardClickHandler);
    });
}

// Event handler for card click
async function cardClickHandler(item) {
    // console.log("fetching songs");
    let folder = item.currentTarget.getAttribute("data-folder");
    await getSongs(`songs/${folder}`); // Fetch songs for the clicked album
    // Play the first song from the clicked album
    playMusic(songs[0]);
}


async function main() {

    // Get the list of all the songs
    await getSongs("songs/cs")
    playMusic(songs[0], true)

    // Call the function to display albums
    displayAlbums();


    // Attach an event listener to play, next, and previous

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

// Listen for timeupdate event 
currentSong.addEventListener("timeupdate", () => {
    // Calculate the progress percentage
    let progressPercentage = (currentSong.currentTime / currentSong.duration) * 100;

    // Update the width and background color of the progress element
    let progressBar = document.querySelector(".seekbar .progress");
    progressBar.style.width = progressPercentage + "%";
    progressBar.style.backgroundColor = "green"; // Change color to green

    // Update the song time display and circle position
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = progressPercentage + "%";
});

// Add an event listener to seekbar 
document.querySelector(".seekbar").addEventListener("click", e => {
    // Calculate the percentage position of the click within the seek bar
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    // Update the progress and song current time accordingly
    let progressBar = document.querySelector(".seekbar .progress");
    progressBar.style.width = percent + "%";
    progressBar.style.backgroundColor = "green"; // Change color to green
    currentSong.currentTime = (currentSong.duration * percent) / 100;
});



    // Add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

   // Add an event listener to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
    const volume = parseInt(e.target.value) / 100;
    console.log("Setting volume to", volume);
    currentSong.volume = volume;

    // Change the volume icon based on the volume level
    if (volume === 0) {
        document.querySelector(".volume>img").src = "img/mute.svg";
    } else {
        document.querySelector(".volume>img").src = "img/volume.svg";
    }
});

// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (currentSong.volume > 0) {
        // If volume is not already muted, set volume to 0 and change icon to mute
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        e.target.src = "img/mute.svg";
    } else {
        // If volume is muted, set volume to 0.1 (10%) and change icon to volume
        currentSong.volume = 0.1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        e.target.src = "img/volume.svg";
    }
});

}

main()


