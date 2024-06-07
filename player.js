import playSound from 'play-sound';
const player = playSound(); 

let hasPlayed = false; // Flag to track if the song has been played

function checkCondition() {
  // ... (Your logic to evaluate the condition)
  return true; // Replace with your actual condition check
}

if (checkCondition() && !hasPlayed) {
  const audioFile = './findSlot.wav';

  player.play(audioFile, (err) => {
    if (err) {
      if (err.killed) {
        console.log('Playback was manually stopped.');
      } else {
        console.error('Error playing audio:', err.message);
      }
    } else {
      console.log('Playing song:', audioFile);
      hasPlayed = true; // Set the flag to true after the song has played
    }
  });
}
