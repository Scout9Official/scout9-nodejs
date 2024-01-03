import polka from 'polka';
import bodyParser from 'body-parser';
import colors from 'kleur';

/** @type (event: WorkflowEvent): Promise<WorkflowResponse> **/
import projectApp from './src/app.js';
import config from './config.js';


const app = polka();

// Use body-parser middleware to parse JSON payloads
app.use(bodyParser.json());

// Define a POST route on the root
app.post('/', async (req, res) => {
  try {
    const response = await projectApp(req.body);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(response));
  } catch (e) {
    console.error(e);
    const code = typeof e?.code === 'number'
        ? e?.code
        : typeof e?.status === 'number'
          ? e?.status
          : 500;
    res.writeHead(code, {'Content-Type': 'application/json'});
    res.end({
      name: e?.name || 'Runtime Error',
      error: e?.message || 'Unknown error',
      code: e?.code || 500
    });

  }
});

app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(config));
});

app.listen(process.env.PORT || 8080, err => {
  if (err) throw err;
  const art = `


 ________  ________  ________  ___  ___  _________  ________     
|\\   ____\\|\\   ____\\|\\   __  \\|\\  \\|\\  \\|\\___   ___\\\\  ___  \\    
\\ \\  \\___|\\ \\  \\___|\\ \\  \\|\\  \\ \\  \\\\\\  \\|___ \\  \\_\\ \\____   \\   
 \\ \\_____  \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\ \\|____|\\  \\  
  \\|____|\\  \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\    __\\_\\  \\ 
    ____\\_\\  \\ \\_______\\ \\_______\\ \\_______\\   \\ \\__\\  |\\_______\\
   |\\_________\\|_______|\\|_______|\\|_______|    \\|__|  \\|_______|
   \\|_________|                                                  
`;
  const art2 = `    ___         __           ____             __         __   
   /   | __  __/ /_____     / __ \\___  ____  / /_  __   / /   
  / /| |/ / / / __/ __ \\   / /_/ / _ \\/ __ \\/ / / / /  / /    
 / ___ / /_/ / /_/ /_/ /  / _, _/  __/ /_/ / / /_/ /  /_/     
/_/  |_\\__,_/\\__/\\____/  /_/ |_|\\___/ .___/_/\\__, /  (_)      
                                   /_/      /____/            
  
`
  const protocol = process.env.PROTOCOL || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 8080;
  const fullUrl = `${protocol}://${host}:${port}`;
  console.log(colors.bold(colors.green(art)));
  console.log(colors.bold(colors.cyan(art2)));
  console.log(`${colors.grey(`${colors.cyan('>')} Running ${colors.bold(colors.white('Scout9'))}`)} ${colors.bold(colors.red(colors.bgBlack('auto-reply')))} ${colors.grey('dev environment on')} ${fullUrl}`);
});
