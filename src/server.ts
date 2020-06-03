import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  app.get('/filteredimage', async (req: Request, res: Response) => {
    const image_url = req.query.image_url;

    // validate the image_url query
    if (image_url.match(/\.(jpeg|jpg|png)$/) == null) {
      res.status(422).send('Please provide valid image');
    }

    // call filterImageFromURL(image_url) to filter the image
    filterImageFromURL(image_url)
      .then((filtered_image) => {
        // send the resulting file in the response
        res.status(200).sendFile(filtered_image, {}, (err) => {
          if (err) {
            res.status(500).send('Failed to send file retry');
          } else {
            // deletes any files on the server on finish of the response
            deleteLocalFiles(filtered_image);
          }
        });
      })
      .catch((err) => {
        // return 404 error if no image found at url
        res.status(404).send(err);
      });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get('/', async (req, res) => {
    res.send('try GET /filteredimage?image_url={{}}');
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
