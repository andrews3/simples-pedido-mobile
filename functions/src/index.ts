const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
admin.initializeApp();

const app = express();

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: '2GB'
};

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

exports.enviaMensagem = functions.runWith(runtimeOpts).database.ref('/shopping/solicitacaoMensagem/{pushId}')
  .onCreate((snapshot, context) => {
    const arrayPromise = [];
    const message = snapshot.val();
    if (message) {
      message['timestamp'] = new Date().getTime();

      // notificacao = m.notificacao;
      // m.notificacao = null;

      if (message.donoTipo === 'cliente') {
        arrayPromise.push(snapshot.ref.parent.parent.child('shoppings').child(message.shoppingId).child('lojas').child(message.lojaId)
          .child('chat').child(message.destinatarioId).child(message.dono).child(message.timestamp).set(message));
      } else {
        arrayPromise.push(snapshot.ref.parent.parent.child('shoppings').child(message.shoppingId).child('lojas').child(message.lojaId)
          .child('chat').child(message.dono).child(message.destinatarioId).child(message.timestamp).set(message));
      }
      arrayPromise.push(snapshot.ref.set(null));
      // if (notificacao.data.token) {
      //   arrayPromise.push(admin.messaging().sendToDevice(notificacao.data.token, notificacao))
      // }
    }

    return arrayPromise;
  });

exports.enviaPedido = functions.runWith(runtimeOpts).database.ref('/shopping/solicitacaoPedido/{pushId}')
  .onCreate((snapshot, context) => {
    const arrayPromise = [];
    const pedido = snapshot.val();

    if (pedido) {
      const referencia = pedido.referencia;
      pedido.referencia = null;
      pedido.timestamp = new Date().getTime();
      const path = snapshot.ref.parent.parent.child('shoppings').child(referencia.shopping).child('lojas').child(referencia.loja)
        .child('pedidos').child(referencia.vendedor.id).child(pedido.cliente.id);
      pedido.id = path.push().key;
      arrayPromise.push(snapshot.ref.set(null));
      arrayPromise.push(path.child(pedido.id).set(pedido));
    }
    return arrayPromise;
  });
