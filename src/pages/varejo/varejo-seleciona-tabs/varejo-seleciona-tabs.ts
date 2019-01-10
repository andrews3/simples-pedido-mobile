import {Component} from '@angular/core';
import {IonicPage, NavController} from 'ionic-angular';
import {VarejoSelecionaTabsShoppingPage} from "../varejo-seleciona-tabs-shopping/varejo-seleciona-tabs-shopping";
import {VarejoSelecionaTabsLojaPage} from "../varejo-seleciona-tabs-loja/varejo-seleciona-tabs-loja";

@IonicPage()
@Component({
  selector: 'page-varejo-seleciona-tabs',
  templateUrl: 'varejo-seleciona-tabs.html',
})
export class VarejoSelecionaTabsPage {

  public shoppingPage = VarejoSelecionaTabsShoppingPage;
  public lojaPage = VarejoSelecionaTabsLojaPage;

  constructor(public navCtrl: NavController) {}
}
