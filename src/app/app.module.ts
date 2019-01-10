import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';

import {MyApp} from './app.component';
import {LoginPage} from "../pages/login/login";
import {UtilProvider} from '../providers/util/util';
import {AngularFireModule} from "angularfire2";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireAuthModule} from "angularfire2/auth";
import {CadastroUsuarioInicialPage} from "../pages/cadastro-usuario-inicial/cadastro-usuario-inicial";
import {BrMaskerModule} from "brmasker-ionic-3";
import {ModalTipoUsuarioComponent} from "../components/modal-tipo-usuario/modal-tipo-usuario";
import {AlertSolicitacaoEnviadaComponent} from "../components/alert-solicitacao-enviada/alert-solicitacao-enviada";
import {VarejoSelecionaTabsPage} from "../pages/varejo/varejo-seleciona-tabs/varejo-seleciona-tabs";
import {VarejoSelecionaTabsShoppingPage} from "../pages/varejo/varejo-seleciona-tabs-shopping/varejo-seleciona-tabs-shopping";
import {VarejoSelecionaTabsLojaPage} from "../pages/varejo/varejo-seleciona-tabs-loja/varejo-seleciona-tabs-loja";
import {PopoverMenuVarejoComponent} from "../components/popover-menu-varejo/popover-menu-varejo";
import {VarejoMenuAtacadoPage} from "../pages/varejo/varejo-menu-atacado/varejo-menu-atacado";
import {ChatPage} from "../pages/chat/chat";
import {HeaderColor} from "@ionic-native/header-color";
import {Toast} from "@ionic-native/toast";
import {VarejoSeparaPedidosPage} from "../pages/varejo/varejo-separa-pedidos/varejo-separa-pedidos";
import {ModalVisualizaFotoComponent} from "../components/modal-visualiza-foto/modal-visualiza-foto";
import {ModalAdicionaProdutoComponent} from "../components/modal-adiciona-produto/modal-adiciona-produto";
import {ProdutoProvider} from '../providers/produto/produto';
import {ModalFinalizaPedidoComponent} from "../components/modal-finaliza-pedido/modal-finaliza-pedido";
import {HttpModule} from "@angular/http";
import {VarejoPedidosPage} from "../pages/varejo/varejo-pedidos/varejo-pedidos";
import {ModalVisualizaPedidoComponent} from "../components/modal-visualiza-pedido/modal-visualiza-pedido";
import {LazyLoadImageModule} from "ng-lazyload-image"
import {AtacadoMenuPage} from "../pages/atacado/atacado-menu/atacado-menu";

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    ChatPage,
    CadastroUsuarioInicialPage,
    VarejoPedidosPage,
    ModalTipoUsuarioComponent,
    ModalVisualizaFotoComponent,
    ModalAdicionaProdutoComponent,
    ModalFinalizaPedidoComponent,
    ModalVisualizaPedidoComponent,
    AlertSolicitacaoEnviadaComponent,
    PopoverMenuVarejoComponent,
    VarejoSelecionaTabsPage,
    VarejoSelecionaTabsShoppingPage,
    VarejoSelecionaTabsLojaPage,
    VarejoMenuAtacadoPage,
    VarejoSeparaPedidosPage,
    AtacadoMenuPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      platforms: {
        ios: {
          backButtonText: "Voltar"
        },
        md: {
          pageTransition: 'ios-transition',
          modalEnter: 'modal-slide-in',
          modalLeave: 'modal-slide-out',
        }
      }
    }),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAZEJ-kgUpDrV3wwqeIRCY5AaWtGZv8oWs",
      authDomain: "simples-pedido-2.firebaseapp.com",
      databaseURL: "https://simples-pedido-2.firebaseio.com",
      projectId: "simples-pedido-2",
      storageBucket: "simples-pedido-2.appspot.com",
      messagingSenderId: "1061528860006"
    }),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrMaskerModule,
    LazyLoadImageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    ChatPage,
    CadastroUsuarioInicialPage,
    VarejoPedidosPage,
    ModalTipoUsuarioComponent,
    ModalVisualizaFotoComponent,
    ModalAdicionaProdutoComponent,
    ModalFinalizaPedidoComponent,
    ModalVisualizaPedidoComponent,
    AlertSolicitacaoEnviadaComponent,
    PopoverMenuVarejoComponent,
    VarejoSelecionaTabsPage,
    VarejoSelecionaTabsShoppingPage,
    VarejoSelecionaTabsLojaPage,
    VarejoMenuAtacadoPage,
    VarejoSeparaPedidosPage,
    AtacadoMenuPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UtilProvider,
    HeaderColor,
    Toast,
    ProdutoProvider
  ]
})
export class AppModule {
}
