
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
apiKey: "TU_API_KEY_OPENAI"
});

app.post("/chat-inventario", async (req, res) => {

try {

const { orden, productos } = req.body;

const prompt = `
Eres un asistente inteligente de inventario.

Debes analizar la orden del usuario y responder SOLO JSON.

Productos disponibles:
${JSON.stringify(productos)}

Ejemplos:

Usuario:
agrega 5 aceites

Respuesta:
{
"respuesta":"Voy a agregar 5 unidades",
"accion":{
"tipo":"entrada",
"cantidad":5,
"producto":"ACEITE"
}
}

Usuario:
saca 3 palitos

Respuesta:
{
"respuesta":"Voy a descontar 3 unidades",
"accion":{
"tipo":"salida",
"cantidad":3,
"producto":"PALITO"
}
}

Orden:
${orden}
`;

const completion = await openai.chat.completions.create({
model: "gpt-4.1-mini",
messages: [
{
role: "system",
content: "Responde únicamente JSON válido."
},
{
role: "user",
content: prompt
}
],
temperature: 0.2
});

let texto = completion.choices[0].message.content;

let json = JSON.parse(texto);

if(json.accion && json.accion.producto){

let productoEncontrado = productos.find(p =>
p.producto.toLowerCase().includes(json.accion.producto.toLowerCase())
);

if(productoEncontrado){

json.accion.productoId = productoEncontrado.id;
json.accion.producto = productoEncontrado.producto;

}

}

res.json(json);

} catch(error){

console.error(error);

res.status(500).json({
respuesta: "Error usando OpenAI",
accion: null
});

}

});

app.listen(3001, () => {
console.log("Servidor IA iniciado en puerto 3001");
});
