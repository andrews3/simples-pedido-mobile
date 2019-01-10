import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from "../pages/login/login";
import {UtilProvider} from "../providers/util/util";
import {VarejoSelecionaTabsPage} from "../pages/varejo/varejo-seleciona-tabs/varejo-seleciona-tabs";
import {HeaderColor} from "@ionic-native/header-color";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              private util: UtilProvider,
              private headerColor: HeaderColor) {
    platform.ready().then(() => {
      if (platform.is('cordova')) {
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString('#11001c');
        splashScreen.hide();
        if (platform.is('android')) {
          this.headerColor.tint('#260031');
        }
      }
      // this.corrigeDados();
      if (window.localStorage.getItem('uid')) {
        this.util.loadUsuario();
        if (window.localStorage.getItem('userTipo') === 'cliente') {
          this.rootPage = VarejoSelecionaTabsPage;
        } else {
          //TODO: Vai pra pagina do atacado;
        }
      } else {
        this.rootPage = LoginPage;
      }
    });
  }

  private corrigeDados() {
    let firebase = this.util.getFirebase();
    let produtos = [];
    firebase.child('shoppings').child('prime').child('lojas').child('bunecaloka').child('movie').once('value').then(snapshot => {
      snapshot.forEach(snapChild => {
        let produto: any;
        produto = snapChild.val();
        produto.tamanhos = null;
        produto.id = snapChild.key;
        produto.grade = [];
        snapChild.child('tamanhos').forEach(snapTamanho => {
          let cor: any = {};
          cor.cor = snapTamanho.child('cor').val();
          cor.foto = snapTamanho.child('url').val();
          cor.id = snapTamanho.key;
          cor.tamanhos = [];
          snapTamanho.forEach(x => {
            if (x.key != 'url' && x.key != 'cor') {
              let tamanho: any = {};
              tamanho.tipo = x.key;
              tamanho.quantidade = x.val();
              cor.tamanhos.push(tamanho);
            }
          });
          produto.grade.push(cor);
        });
        produtos.push(produto);
      });
      console.log(produtos);
      this.adicionaV2Banco(produtos);
    });
  }

  private adicionaV2Banco(produtos) {
    let gradePath = this.util.getFirebase().child('shoppings').child('prime').child('lojas').child('bunecaloka').child('produtos');
    for (let produto of produtos) {
      let grade = produto.grade;
      produto.grade = null;
      produto.nome = produto.name;
      produto.name = null;
      produto.descricao = null;
      gradePath.child(produto.id).set(produto);
      for (let cor of grade) {
        let tamanhos = cor.tamanhos;
        cor.tamanhos = null;
        gradePath.child(produto.id).child('grade').child(cor.id).set(cor);
        for (let tamanho of tamanhos) {
          let tamanhoPath = gradePath.child(produto.id).child('grade').child(cor.id).child("tamanhos");
          let tamanhoId = tamanhoPath.push().key;
          tamanho.id = tamanhoId;
          tamanhoPath.child(tamanhoId).set(tamanho);
        }
      }
    }
  }
}

