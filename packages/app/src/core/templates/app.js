import polka from 'polka';
import bodyParser from 'body-parser';

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
  const protocol = process.env.PROTOCOL || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 8080;
  const fullUrl = `${protocol}://${host}:${port}`;
  console.log(`> Running Scout9 auto-reply dev server on ${fullUrl}`);
});
