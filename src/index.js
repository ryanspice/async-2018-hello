
import './utils.js';

import {
	AsyncView,
	AsyncTemplate
} from "./entry";


const data = [];

let index = 0;
for(var i = 0; i<=125; i++){
	data.push({
		id:i,
		tag:Math.random(i*i),
		time:((new Date()).getTime())
	});
}

let justScrolled = false;
const template = new AsyncTemplate();
let divs;
let debug = true;

const elementHeight:number= 115.88 * 2;

const getHeight = e => Math.floor((window.innerHeight/elementHeight) * 1.2);
const getMaxHeight = elementHeight => window.innerHeight-(elementHeight*2)+"px";

export {template, AsyncTemplate}

/**
 * asynx VirtualScroll component
 * -appends and prepends elements to limit memory
 * @type {[type]}
 */

export default class VirtualScroll extends AsyncView {

	type:string = `virtual-scroll`;
	innerHTML:string = `<template></template>`;

	// TEMPORARY CODE
	//
	// Asyncronyously append children to the dom based on list data
	// 	- to be brought into asynx

	mounted:Function = async function(evt){

		//!this.element ? this.element = document.getElementById(this.id) : null;

		this.style.maxHeight = getMaxHeight(elementHeight);

		//Push Items
		for (let i = 0; i<=getHeight()+6; i++){

			if(!data[i])
				continue;

			template.a();

			template.template[0] = await [

				await new VirtualItem(data[i])

			];

			await template.iterateTemplate();
		}

		divs = await this.getElementsByTagName("virtual-item");

		/**
		 * append and prepend on scroll
		 * @param  {[type]}  event [description]
		 * @return {Promise}       [description]
		 */

		this.addEventListener("scroll", async (event)=>{

			if (
					(index>0)	&&
					(this.children[1].getClientRects()[0].y+elementHeight>0)
				){

					index--;
					if (this.scrollTop<=1)
					this.scrollTop+=1;



					await VirtualItem.UpdateItem(divs[divs.length-1], data[index]);

					await divs[divs.length-1].appendBefore(divs[0]);

				return;
			} else if (
					(index<data.length-getHeight()-1)	&&
					(this.children[divs.length].getClientRects()[0].y+elementHeight<window.innerHeight)
				){

				index++;

				await VirtualItem.UpdateItem(divs[0], data[index+getHeight()+1]);

				let b = this.children[divs.length];

				await divs[0].appendAfter(b);

				return;
			}

			this.scrollTop = Math.floor(10*this.scrollTop)/10;

		});

		// RESIZING
		//
		// Add additional dom elements when resizing the page larger
		//  - no compensation for smarller

		window.addEventListener("optimizedResize", async()=> {

				this.style.maxHeight = getMaxHeight(elementHeight);

				for (let i = 0; i<1; i++){

					await template.a();
					template.defer = await [];
					template.template[0] = await [
						await new VirtualItem(data[i+divs.length])
					];
					await index++;
					await template.iterateTemplate();

				}

				divs = await this.getElementsByTagName("virtual-item");
				index=0;

		});

	}

}

/**
 * Elemented Rendered inside of VirtualList
 * @extends AsyncView
 */

class VirtualItem extends AsyncView {

	/**
	 * updates a given item
	 * @param  {[type]} item [description]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */

	static UpdateItem = async function(item, data){

		item.getElementsByTagName('h3')[0].innerText = data.id;
		item.getElementsByTagName('p')[0].innerText = data.tag;

	}

	//style:string = ``;
	type:string = `virtual-item`;
	renderTo:string = `virtual-scroll`;

	/**
	 * element information values are passed through the DATA parameter
	 * @param {[type]} data [description]
	 */

	constructor(data){

		return super({
			innerHTML:`<svg class="feather feather-x sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-reactid="1376"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
			<img width="${elementHeight}" height="${elementHeight}" style="float:left;" src="./assets/150.png" srcs="https://picsum.photos/${elementHeight}/?random${data.time}"/> <h3>${data.id}</h3><p>${data.time}</p>`
		});
	}

	/**
	 * triggers when element is visible on page
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */

	mounted = (data) => {
		//console.log(data);
		//console.log(this);
	}

}
