import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "admin",
  port: 5433,
});
db.connect();

//Mittel Ware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

//get Methode
app.get("/", async (req, res) => {
  //Write your code here.
const countries = await checkVisisted();
res.render("index.ejs",{countries: countries, total: countries.length});

});

//Post
app.post("/add", async(req, res) => {
  const input = req.body["country"];
  console.log(input);
  try{
  const result2 = await db.query(
    "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
  )
    const data = result2.rows[0];
    const newLand = data.country_code;
  try{
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [newLand]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country has already been added, try again.",
    });
  }
} catch (err) {
  console.log(err);
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    error: "Country name does not exist, try again.",
  });
}
  
});

//delete
app.post("/del", async (req, res)=> {

  const input1 = req.body["country"];
  const deleInput_COde = await db.query(
    "select country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input1.toLowerCase()]
  );
 
  if(deleInput_COde.length != 0){
    const del = deleInput_COde.rows[0].country_code;
    try{
      console.log(del);

      await db.query("delete FROM visited_countries WHERE (country_code) LIKE '%' || $1 || '%';",[del]);
      
      countries.forEach((code) =>{
        if(countries[code] === del){
          countries[code] ="";
        }
      });
       console.log(countries);
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country name could't removed",
      });
    }
  }
 

});


app.get("/delAll", async(req, res) =>{
 
  try{
    const countries = await checkVisisted();
    
  await db.query("truncate table visited_countries;");
    
    console.log(countries);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }

    
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
