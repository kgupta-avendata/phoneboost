import { Component } from '@angular/core';
import { NavController, Events, Platform, ViewController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SocialSharing } from '@ionic-native/social-sharing';


@Component({
    selector: 'page-about',
    templateUrl: 'about.html',
})
export class AboutPage {

    constructor(public navCtrl: NavController, public events: Events, private socialSharing: SocialSharing, public platform: Platform, public viewCtrl: ViewController) {
      	this.platform.registerBackButtonAction((event)=>{
        	this.backToHome(event);
      	})
    }

  	backToHome(event) {
	  	this.navCtrl.setRoot(HomePage, {});
	}

	ionViewDidLoad() {
		this.viewCtrl.setBackButtonText('');
	}
	
	shareApp() {
		this.socialSharing.share("This page is shared from PhoneBoost app", "PhoneBoost App", "", "https://phoneboost.de");
	}
}