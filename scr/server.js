// Den email validator habe ich von Leon bekommen und auch selber im internet dazu recherchiert
const validator = require("email-validator");
const session = require('express-session');
const { randomUUID } = require('node:crypto');
const express = require('express');
const app = express();
const port = 3001;

//generated von ChatGPT
let tasks = [
    { id: 1, Titel: "Abwasch machen", Autor: "Leon David", Erstellungsdatum: "23.02.2023", Erfüllungsdatum: "24.02.2023" },
    { id: 2, Titel: "Einkauf erledigen", Autor: "Anna Müller", Erstellungsdatum: "25.02.2023", Erfüllungsdatum: "27.02.2023" },
    { id: 3, Titel: "Arzttermin vereinbaren", Autor: "Sophie Schmidt", Erstellungsdatum: "26.02.2023", Erfüllungsdatum: "28.02.2023" },
    { id: 4, Titel: "Buch lesen", Autor: "Max Mustermann", Erstellungsdatum: "27.02.2023", Erfüllungsdatum: "03.03.2023" },
    { id: 5, Titel: "Geburtstagsgeschenk besorgen", Autor: "Lena Meier", Erstellungsdatum: "28.02.2023", Erfüllungsdatum: "02.03.2023" },
    { id: 6, Titel: "Laufen gehen", Autor: "Tom Becker", Erstellungsdatum: "01.03.2023", Erfüllungsdatum: "03.03.2023" },
    { id: 7, Titel: "Staubsaugen", Autor: "Laura Schneider", Erstellungsdatum: "02.03.2023", Erfüllungsdatum: "04.03.2023" },
    { id: 8, Titel: "Steuererklärung machen", Autor: "Tim Weber", Erstellungsdatum: "03.03.2023", Erfüllungsdatum: "10.03.2023" },
    { id: 9, Titel: "Projektbericht schreiben", Autor: "Nina Hofmann", Erstellungsdatum: "04.03.2023", Erfüllungsdatum: "08.03.2023" },
    { id: 10, Titel: "Kochen lernen", Autor: "David Schmidt", Erstellungsdatum: "05.03.2023", Erfüllungsdatum: "07.03.2023" }
  ];
  
// Middle wares
app.use(express.json())

app.use(session({
  secret: 'supersecret',
	resave: false,
	saveUninitialized: false,
  cookie: {}
}))

// auth email und passwort
const loginInfo = { email: "beispiel@email.com", password: "m295" }

// Authentifizierung für tasks Endpunkte
// Hierfür habe ich die gestrigen aufgaben als referenz benutzt
app.post('/login', function (request, response) {
	const { email, password } = request.body

  if(validator.validate(request.body.email) === true){
	if (password == loginInfo.password) {
		request.session.email = email

		return response.status(200).json({ email: request.session.email })
	}
  return response.status(401).json({error: "Bitte gib ein gültiges Login ein"})
} else {
  return response.status(401).json({error: "Bitte gib eine gültige Email ein"})
}})

app.get('/verify', function (request, response) {
  const email = request.session.email
	if (email) {
		return response.status(200).json({ email: email })
  }
  return response.status(401).json({ error: "Nicht eingeloggt" })
})

app.delete('/logout', function (request, response) {
	if (request.session.email) {
		request.session.email = null
		return response.status(204).json({ logout: "Ausgelogged"})
	}
  return response.status(401).json({ error: "Noch nicht eingelogged" })
})

// Diese Funktion hab eich vom Internet, aber ich hbae sie überarbeitet sodass sie funktioniert und in allen endpunkten gesetzt
const authenticate = (request, response, next) => {
  if (request.session.email) {
    next();
  } else {
    response.status(401).json({ error: "Nicht Eingelogged" });
  }
};


// tasks Endpunkte
app.get('/tasks', authenticate, (request,response) => {
    response.status(200).send(tasks);
});

app.get('/tasks/:id', authenticate, (request, response) => {
  const taskId = request.params.id;

  if(taskId in tasks){
  response.send(tasks.find(task => task.id === taskId ))
  } else {
    return response.status(404).send("Bitte geben sie eine gültige ID ein")
  }
});

app.post('/tasks', authenticate, (request, response) => {
  const newTask = request.body;
  newTask['id'] = randomUUID();

  tasks = [...tasks, newTask];
  response.status(201).send(tasks);
  });


// Es hatte einen Syntax fehler ich habe ihn nicht gefunden dann habe ich ihn von ChatGPT korrigieren lassen und dann gesehen das es einen Fehler mit Task.id gab und request.params.id
app.patch('/tasks/:id', authenticate, (request, response) => {
  const keys = Object.keys(request.body);
  const id = request.params.id

  if(id in tasks){
  const oldtask = tasks.find((task) => String(task.id) === id);
  keys.forEach((key) => oldtask[key] = request.body[key]);
  tasks = tasks.map((task) => task.id === id ? oldtask : task);
  response.send(tasks);
  } else {
    return response.status(404).send("Bitte geben sie eine gültige ID ein")
  }
});

// Hier hatte ich wieder den gleichen Syntax fehler wie vorhin und habe ihn dann behoben
app.delete('/tasks/:id', authenticate, (request, response) => {
  const id = request.params.id

  if(id in tasks){
  tasks = tasks.filter((task) => String(task.id) !== id);
  response.send(tasks);
  } else {
    return response.status(404).send("Bitte geben sie eine gültige ID ein")
  }
});

app.listen(port, () => {
    console.log(`tasks app listening on port ${port}`);
  });