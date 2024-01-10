import polka from 'polka';
import bodyParser from 'body-parser';
import colors from 'kleur';
import { config as dotenv } from 'dotenv';

/** @type (event: WorkflowEvent): Promise<WorkflowResponse> **/
import projectApp from './src/app.js';
import config from './config.js';
import path from 'node:path';
import fs from 'node:fs';
import { Configuration, Scout9Api } from '@scout9/admin';


// Ensure .env config is set (specifically SCOUT9_API_KEY)
const configFilePath = path.resolve(process.cwd(), './.env');
dotenv({path: configFilePath});

const configuration = new Configuration({
  apiKey: process.env.SCOUT9_API_KEY
});
const scout9 = new Scout9Api(configuration);

const handleError = (e, res) => {
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

const app = polka();

app.use(bodyParser.json());

// Root application POST endpoint will run the scout9 app
app.post('/', async (req, res) => {
  try {
    // @TODO use zod to check if req.body is a valid event object
    const response = await projectApp(req.body);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(response));
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(config));
});


// For local development: parse a message
app.get('/dev/parse', async (req, res, next) => {
  try {
    res.writeHead(200, {'Content-Type': 'application/json'});
    // req.body: {message: string}
    const context = await scout9.parse(req.body).then((res => res.json()));
    res.end(JSON.stringify(context));
  } catch (e) {
    handleError(e, res);
  }
});

app.get('/dev/response', async (req, res, next) => {
  try {
    res.writeHead(200, {'Content-Type': 'application/json'});
    // req.body: {conversation: {}, messages: []}
    const context = await scout9.generate(req.body).then((res => res.json()));
    res.end(JSON.stringify(context));
  } catch (e) {
    handleError(e, res);
  }
});


app.listen(process.env.PORT || 8080, err => {
  if (err) throw err;


  const art_scout9 = `


 ________  ________  ________  ___  ___  _________  ________     
|\\   ____\\|\\   ____\\|\\   __  \\|\\  \\|\\  \\|\\___   ___\\\\  ___  \\    
\\ \\  \\___|\\ \\  \\___|\\ \\  \\|\\  \\ \\  \\\\\\  \\|___ \\  \\_\\ \\____   \\   
 \\ \\_____  \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\ \\|____|\\  \\  
  \\|____|\\  \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\    __\\_\\  \\ 
    ____\\_\\  \\ \\_______\\ \\_______\\ \\_______\\   \\ \\__\\  |\\_______\\
   |\\_________\\|_______|\\|_______|\\|_______|    \\|__|  \\|_______|
   \\|_________|                                                  
`;
  const art_auto_reply = `    ___         __           ____             __         __   
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
  console.log(colors.bold(colors.green(art_scout9)));
  console.log(colors.bold(colors.cyan(art_auto_reply)));
  console.log(`${colors.grey(`${colors.cyan('>')} Running ${colors.bold(colors.white('Scout9'))}`)} ${colors.bold(colors.red(colors.bgBlack('auto-reply')))} ${colors.grey('dev environment on')} ${fullUrl}`);

  // Run checks
  if (!fs.existsSync(configFilePath)) {
    console.log(colors.red('Missing .env file, your auto reply application may not work without it.'));
  }

  if (!process.env.SCOUT9_API_KEY) {
    console.log(colors.red('Missing SCOUT9_API_KEY environment variable, your auto reply application may not work without it.'));
  }

  if (process.env.SCOUT9_API_KEY === '<insert-scout9-api-key>') {
    console.log(`${colors.red('SCOUT9_API_KEY has not been set in your .env file.')} ${colors.grey('You can find your API key in the Scout9 dashboard.')} ${colors.bold(colors.cyan('https://scout9.com'))}`);
  }
});
