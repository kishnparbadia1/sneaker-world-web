const { client, syncAndSeed} = require('./db')
const express = require('express')
const path = require('path')

const app = express()
 
//so styles.css can be used
app.use('/assets', express.static(path.join(__dirname, 'assets')))

//here we will configure our express pipeline
//we want to get all of our sneaker brands

app.get('/', async(req, res, next) => {
    try{
        const response = await client.query('SELECT * FROM "Brand";');
        const brands = response.rows;
        res.send(`
            <html>
                <head>
                  <link rel='stylesheet' href='/assets/styles.css' />
                </head>
                <body>
                    <h1>Sneaker World</h1>
                    <h2>Brands</h2>
                    <ul>
                      ${
                        brands.map( brand => `
                          <li>
                            <a href=' /brands/${brand.id}'>
                            ${ brand.name }
                            </a>
                          </li>
                        `).join('')
                      }
                    </ul>
                </body>
            </html>
        `);
    }
    catch(ex) {
        next(ex) // sends error message so the browser isnt continuously spinning
    }
})


app.get('/brands/:id', async(req, res, next) => {
  try{
      const promises = [
        client.query('SELECT * FROM "Brand" WHERE id=$1;', [req.params.id]),
        client.query('SELECT * FROM "Sneaker" WHERE brand_id =$1', [req.params.id])
      ];
      const [brandsResponse, sneakersResponse] = await Promise.all(promises);
      const brand = brandsResponse.rows[0];
      const sneakers = sneakersResponse.rows;
      res.send(`
          <html>
              <head>
                <link rel='stylesheet' href='/assets/styles.css' />
              </head>
              <body>
                  <h1>Sneaker World</h1>
                  <h2><a href='/'>Brands</a> (${ brand.name })</h2>
                  <ul>
                    ${
                      sneakers.map( sneaker => `
                        <li>
                          ${ sneaker.name }
                        <li>
                      `).join('')                   
                    }
                  </ul>
              </body>
          </html>
      `);
  }
  catch(ex) {
      next(ex) // sends error message so the browser isnt continuously spinning
  }
})

const port = process.env.PORT || 3004;


const setUp = async() => {
    try{
        await client.connect();
        await syncAndSeed();
        console.log('connected to database');
        app.listen(port, () => console.log(`listening on port ${port}`))
    }
    catch(ex){
        console.log(ex)
    }
}

setUp()