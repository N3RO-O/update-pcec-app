(() => {
 'use strict';
 const reveal=()=>{const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const item=document.getElementById(id);if(item?.tagName==='DETAILS'){item.open=true;item.scrollIntoView();}};
 reveal();window.addEventListener('hashchange',reveal);
 let printClosed=[];window.addEventListener('beforeprint',()=>{printClosed=[...document.querySelectorAll('details:not([open])')];for(const item of printClosed)item.open=true;});window.addEventListener('afterprint',()=>{for(const item of printClosed)item.open=false;printClosed=[];});
 const filter=document.querySelector('[data-feature-filters]');if(!filter)return;
 const search=document.getElementById('feature-search'),module=document.getElementById('feature-module'),state=document.getElementById('feature-state');
 const cards=[...document.querySelectorAll('[data-feature]')],count=document.getElementById('feature-count'),empty=document.getElementById('feature-empty');
 const paint=()=>{const words=search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);let visible=0;for(const card of cards){const match=(!module.value||card.dataset.module===module.value)&&(!state.value||card.dataset.status===state.value)&&words.every(word=>card.dataset.search.includes(word));card.hidden=!match;if(match)visible++;}count.textContent=`${visible} of ${cards.length} features`;empty.hidden=visible!==0;};
 search.addEventListener('input',paint);module.addEventListener('change',paint);state.addEventListener('change',paint);
 document.getElementById('clear-features').addEventListener('click',()=>{search.value=module.value=state.value='';paint();search.focus();});filter.hidden=false;paint();
})();
