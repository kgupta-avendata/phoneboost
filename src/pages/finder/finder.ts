import { Component, ElementRef, ViewChild} from '@angular/core';
import { NavController, Events, Platform, Loading, LoadingController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AlertController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ViewController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, CameraPosition, LatLng, GoogleMapsEvent, Marker, MarkerOptions, GoogleMapsAnimation } from "@ionic-native/google-maps";
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { HTTP } from '@ionic-native/http';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

declare var google;

@Component({
    selector: 'page-finder',
    templateUrl: 'finder.html'
})
export class FinderPage {
	@ViewChild('map')
	mapElement: ElementRef;
	map: GoogleMap;
	loading: Loading;
	data: any;
	markerClicked: boolean = false;
	x: number = 0;
	y: number = 0;
	loc: LatLng;
	items: Array<string>;
	dummyPositions: Array<any>;
	latLngg: any;
	dict: Array<any>; // create an empty array
	searchClicked: boolean = true;
	addOverlay: boolean = true;
	viewResult: boolean = true;

  	constructor(public navCtrl: NavController, public events: Events, public alertCtrl: AlertController, private socialSharing: SocialSharing, public platform: Platform, public _googleMaps:GoogleMaps, public _geoLoc: Geolocation, public viewCtrl: ViewController, public loadingCtrl: LoadingController, public network: Network, public http: HTTP, public launchNavigator: LaunchNavigator) {
		this.platform.registerBackButtonAction((event)=>{
			this.loadingStop();
			if(this.markerClicked) {
				this.markerClicked = !this.markerClicked;
				this.updateUi();
			} else {
				this.backToHome(event);
			}
		});
		this.loadingStart();
		this.data = {
			name: "",
			address: "",
			openingTime: []
		}
		let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
			// this.doAlert("Network Error!", "Network was disconnected!");
		});
		
	}
  
	ngAfterViewInit(){
		let loc : LatLng;
		this.initMap();
		this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
			this.getLocation().then ( res => {
				loc = new LatLng(res.coords.latitude, res.coords.longitude);
				this.moveCamera(loc);

				this.map.setOptions({
					'controls': {
						compass: true,
						myLocation: true,
						myLocationButton: false,
						indoorPicker: true,
						mapToolbar: false,
						zoom: true
					},
					'gestures': {
						'scroll': true, 'tilt': false, 'rotate': true, 'zoom': true
					},
				});

				this.addCluster(this.dummyData());
				this.calculateDistance(this.dummyData());
				this.loadingStop();
			}).catch(err => {
				this.loadingStop();
				this.doAlert("Permission Error", "Need to allow location permission");
				this.backToHome("HomePage");
			});
		}).catch( err => {
			alert(err);
		});
		this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(
			(data) => {
				if(this.markerClicked) {
					this.markerClicked = false;
					this.searchClicked = false;
					this.updateUi();
				}
			}
		);
	}

	calculateDistance(rows) {
		let usersLocation: LatLng;
		let placeLocation: LatLng;
		let distance: any;
		try {
			this.getLocation().then ( res => {
				this.dict = [];
				usersLocation = new LatLng(res.coords.latitude, res.coords.longitude);
				for(let i = 0; i < rows.length; i++) {
					placeLocation = new LatLng(rows[i].position.lat, rows[i].position.lng);
					// console.log('Place ' +  (i + 1) + " " + placeLocation);
					distance = this.getDistanceBetweenPoints(usersLocation, placeLocation, 'miles').toFixed(2);
					if(distance < 1 && distance > 0){
						distance = distance * 1000;
						// console.log('distance ' +  (i + 1) + " " + distance);
						this.dict.push({
							key:   rows[i].name,
							value: distance + ' m'
						});
					}else{
						// console.log('distance ' +  (i + 1) + " " + distance);
						this.dict.push({
							key:   rows[i].name,
							value: distance + ' Km'
						});
					}

					
					// console.log(this.dict);
				}
			});
		} catch(err) {}
	}

	getDistanceByName(name) {
		try {
			for(let i = 0; i < this.dict.length; i++) {
				if(this.dict[i].key == name) {
					return this.dict[i].value;
				}
			}
		} catch(err){}
	}

	addCluster(data) {
		this.map.addMarkerCluster({
			boundsDraw: false,
			markers: this.dummyData(),

			icons: [
				{ min: 2, max: 100, url: "./assets/icon/markers.png"}
			]
		})
		.then((markerCluster) => {
			markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((cluster) => {
				let latLng: LatLng = cluster[0];
				let marker: Marker = cluster[1];
				let markerId = new String(cluster[1]._objectInstance.id);
				let index = parseInt(markerId.substr(markerId.lastIndexOf("_") + 1, markerId.length));
				let temp = this.dummyData()[index];
				
				this.markerClicked = true;
				this.searchClicked = false;
		
				this.data = {
					name: temp.name,
					address: temp.address,
					position: temp.position,
					openingTime: [ temp.Mo, temp.Di, temp.Mi, temp.Do, temp.Fr, temp.Sa ]
				}
				this.updateUi();
				// marker.setAnimation(GoogleMapsAnimation.BOUNCE);
			});
		});
	}

	initMap(){
		let element = this.mapElement.nativeElement;
		this.map = this._googleMaps.create(element);
	}

	getLocation(){
		return this._geoLoc.getCurrentPosition();
	}

	showMyLocation(){
		this._geoLoc.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {
			// console.log(resp.coords.latitude+", "+resp.coords.longitude);
			let location = new LatLng(resp.coords.latitude, resp.coords.longitude);
		
			let options: CameraPosition<LatLng> = {
				target: location,
				zoom: 15,
				tilt: 10,
			}
			this.map.moveCamera(options);
		}).catch((error) => {
			console.log('Error getting location', error);
		});
	}

	moveCamera(loc: LatLng){
		let options: CameraPosition<LatLng> = {
			target: loc,
			zoom: 8,
			tilt: 10
		}
		this.map.moveCamera(options);
	}

	ionViewDidLoad() {
		this.viewCtrl.setBackButtonText('');
	};

	createMarker(loc: LatLng, title: string){
		let markerOptions: MarkerOptions = {
			position: loc,
			title: title
		}
		return this.map.addMarker(markerOptions);
	}

	goToRoute(){
		let options: LaunchNavigatorOptions = {
			start: this.getCurrentCoords()
		};

		this.launchNavigator.navigate([this.data.position.lat, this.data.position.lng], options)
		.then(
			success => console.log('Launched navigator'),
			error => console.log('Error launching navigator', error)
		);
	}

	closeMarker(){
		this.markerClicked = !this.markerClicked;
	}

	backToHome(event) {
		this.navCtrl.setRoot(HomePage, {});
	}

	getCurrentCoords() {
		let coords="";
		this.getLocation().then ( res => {
			coords += res.coords.latitude + "," + res.coords.longitude;
			
		});
		return coords;
	}

	shareApp() {
		let coords = this.getLocation().then ( res => {
			let link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + res.coords.latitude + "," + res.coords.longitude + "&radius=500&key=YOUR_API_KEY"
			this.socialSharing.share("message", "subject", null, link);
		});
	}

	doAlert(title, message) {
		let alert = this.alertCtrl.create({
			title: title,
			message: message,
			buttons: ['Ok']
		});
		alert.present()
	}

	loadingStart(){
		this.loading = this.loadingCtrl.create({
		 content: 'Please Wait...',
	   });
		this.loading.present();
	}
 
	loadingStop(){
		this.loading.dismissAll();
	}

	updateUi() {
		let loading = this.loadingCtrl.create({
			content: 'Please wait...'
		});
		loading.present();
		setTimeout(() => {
			loading.dismiss();
		}, 100);
	}

	dummyData() {
		return [
			{
				position: {
					lat: 19.1013200, lng: 72.8797936,
				},
				name: "Avendata",
				address: "khar west dadar",
				phone: "808-484-1488",
				Mo: "Mo 10:00-19:00",
				Di: "Di 10:00-19:00",
				Mi: "Mi 10:00-19:00",
				Do: "Do 10:00-19:00",
				Fr: "Fr 10:00-19:00",
				Sa: "Sa 10:00-19:00",
				icon: "./assets/icon/markers.png"
			},
			{
				position: {
					lat: 19.1113200, lng: 72.8697936
				},
				name: "GmbH",
				address: "Andheri East thane",
				phone: "808-484-9548",
				Mo: "Mo 10:00-19:00",
				Di: "Di 10:00-19:00",
				Mi: "Mi 10:00-19:00",
				Do: "Do 10:00-19:00",
				Fr: "Fr 10:00-19:00",
				Sa: "Sa 10:00-19:00",
				icon: "./assets/icon/markers.png"
			},
			{
				position: {
					lat: 19.1213200, lng: 72.8597936
				},
				name: "Avendata GmbH",
				address: "Andheri west Mumbai",
				phone: "808-488-9313",
				Mo: "Mo 10:00-19:00",
				Di: "Di 10:00-19:00",
				Mi: "Mi 10:00-19:00",
				Do: "Do 10:00-19:00",
				Fr: "Fr 10:00-19:00",
				Sa: "Sa 10:00-19:00",
				icon: "./assets/icon/markers.png"
			},
			{
				position: {
					lat: 19.1313200, lng: 72.8497936
				},
				name: "Avendata Technologies",
				address: "juhu East Mumbai",
				phone: "808-484-9355",
				Mo: "Mo 10:00-19:00",
				Di: "Di 10:00-19:00",
				Mi: "Mi 10:00-19:00",
				Do: "Do 10:00-19:00",
				Fr: "Fr 10:00-19:00",
				Sa: "Sa 10:00-19:00",
				icon: "./assets/icon/markers.png"
			},
			{
				position: {
					lat: 19.1413200, lng: 72.8397936
				},
				name: "Avendata Technologies Pvt. Ltd.",
				address: "borivali East Mumbai",
				phone: "808-638-0341",
				Mo: "Mo 10:00-19:00",
				Di: "Di 10:00-19:00",
				Mi: "Mi 10:00-19:00",
				Do: "Do 10:00-19:00",
				Fr: "Fr 10:00-19:00",
				Sa: "Sa 10:00-19:00",
				icon: "./assets/icon/markers.png"
			},
			{
				position: {
					lat: 19.1513200, lng: 72.8297936
				},
				name: "Avendata Mumbai",
				address: "bandra East Mumbai",
				phone: "808-638-0341",
				Mo: "Mo 10:00-19:00",
				Di: "Di 10:00-19:00",
				Mi: "Mi 10:00-19:00",
				Do: "Do 10:00-19:00",
				Fr: "Fr 10:00-19:00",
				Sa: "Sa 10:00-19:00",
				icon: "./assets/icon/markers.png"
			}
		];
	};
	
	abc(ev:any) {
		this.dummyPositions = this.dummyData();
		var searchObject = [];
		let val = ev.target.value;
		// console.log(val);

		if (val) {
			this.dummyPositions = this.dummyPositions.filter(function(item) {
				var a = item.address.toLowerCase();
				if (a.includes(val.toLowerCase())) {
					searchObject.push(item);
				}
				// console.log(searchObject);
			});
		}

		return searchObject;
	};

	filterPositions(ev: any) {
		this.items = this.abc(ev);

		// console.log(this.items);
		// return this.items;
	}

	applyHaversine(locations){

		this.getLocation().then ( res => {
			let usersLocation = {
				lat: res.coords.latitude,
				lng: res.coords.longitude
			};
		 
			locations.map((location) => {
	
				let placeLocation = {
					lat: location.latitude,
					lng: location.longitude
				};
	
				location.distance = this.getDistanceBetweenPoints(
					usersLocation,
					placeLocation,
					'miles'
				).toFixed(2);
			});
			
		});
 
        return locations;
	}
	
	getDistanceBetweenPoints(start, end, units){
 
        let earthRadius = {
            miles: 3958.8,
            km: 6371
        };
 
        let R = earthRadius[units || 'km'];
        let lat1 = start.lat;
        let lon1 = start.lng;
        let lat2 = end.lat;
        let lon2 = end.lng;
 
        let dLat = this.toRad((lat2 - lat1));
        let dLon = this.toRad((lon2 - lon1));
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
 
        return d;
 
    }
 
    toRad(x){
        return x * Math.PI / 180;
	}
	
	searchClick(){
		this.items = [];
		this.searchClicked = !this.searchClicked;
		this.addOverlay = !this.addOverlay;


		if(this.markerClicked) {
			this.markerClicked = false;
			console.log(this.data);
		}
	}

	showLocationByName(name) {
		console.log(name);
		let data = this.dummyData();
		this.data = [];
		for(let i = 0; i < data.length; i++) {
			if(data[i].name == name) {
				let loc: LatLng;
				loc = new LatLng(data[i].position.lat, data[i].position.lng);
				this.searchClicked = false;
								
				let options: CameraPosition<LatLng> = {
					target: loc,
					zoom: 15
				}
				this.map.moveCamera(options);
				this.searchClicked = false;
				this.markerClicked = true;
				this.data = {
					name: data[i].name,
					address: data[i].address,
					position: data[i].position,
					openingTime: [ data[i].Mo, data[i].Di, data[i].Mi, data[i].Do, data[i].Fr, data[i].Sa ]
				}
				break;
			}
		}
	}

	closeSearch(){}

	// getRemoteData(){
    //     this.http.get('https://www.reddit.com/r/gifs/top/.json?limit=105sort=hot').map(res => res.json()).subscribe(data => {
    //         alert(data);
    //     };
    // }

    // getLocalData(){		
	// 	return this.http.get('assests/data/mapData.json', {}, {}).then(response => {
	// 		alert(response);
	// 		return response;
	// 	});

	// 	// return new Promise(resolve => {
	// 	// 	this.http.get('assests/data/mapData.json', {}, {}).then(response => {
	// 	// 		resolve(response);
	// 	// 	});
	// 	// });
	// }
}
