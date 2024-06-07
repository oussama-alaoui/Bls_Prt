import { fork } from 'child_process';

// run the child process
const child = ()=>{
    const child = fork('index.js', ['RABAT', 'LS', 'Studies', '1']);
    console.log('Child process started:', child);
}
child();