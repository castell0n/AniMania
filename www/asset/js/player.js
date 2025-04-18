// const player = document.getElementById("player");
// const videopreview = document.getElementById("videopreview");
// const vidlink = localStorage.getItem("vidlink") || "Todas";

// videopreview.style.backgroundImage = `url(https://raw.githubusercontent.com/Ahmetaksungur/twitter-video-player-clone/master/92456705_506989316849451_7379405183454806542_n.jpg)`;
// player.innerHTML = `<source id="datasrc" src="https://pixeldrain.com/api/file/gxQJoZbR" type="video/mp4"`;




document.addEventListener('DOMContentLoaded', () => {
    // Controls (as seen below) works in such a way that as soon as you explicitly define (add) one control
    // to the settings, ALL default controls are removed and you have to add them back in by defining those below.

    // For example, let's say you just simply wanted to add 'restart' to the control bar in addition to the default.
    // Once you specify *just* the 'restart' property below, ALL of the controls (progress bar, play, speed, etc) will be removed,
    // meaning that you MUST specify 'play', 'progress', 'speed' and the other default controls to see them again.

    const controls = [
        'play-large', // The large play button in the center
        'play', // Play/pause playback
        'progress', // The progress bar and scrubber for playback and buffering
        'current-time', // The current time of playback
        'duration', // The full duration of the media
        'mute', // Toggle mute
        'fullscreen' // Toggle fullscreen
    ];

    const player = Plyr.setup('.js-player', { controls });

});
