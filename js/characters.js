class Characters {
    constructor(){this.cache={};}
    get(id){
        if(this.cache[id])return this.cache[id];
        const def=id==='player' ? {skin:'#a96d49',shirt:'#fff0cb',hair:'#29232e',gender:'m',hat:null} : DATA.CHARACTERS.find(c=>c.id===id);if(!def)return null;
        const canvas=document.createElement('canvas');canvas.width=24;canvas.height=32;
        const ctx=canvas.getContext('2d');this.drawSprite(ctx,def);
        return this.cache[id]={canvas,ctx,def};
    }
    drawSprite(c,d){
        c.fillStyle='#26312d';c.fillRect(3,29,18,3);
        c.fillStyle='#292b38';c.fillRect(6,23,5,7);c.fillRect(14,23,5,7);
        c.fillStyle='#352c32';c.fillRect(5,29,6,2);c.fillRect(14,29,6,2);
        c.fillStyle=d.shirt;c.fillRect(5,16,15,10);c.fillRect(3,18,19,6);
        c.fillStyle=d.skin;c.fillRect(3,22,3,4);c.fillRect(19,22,3,4);c.fillRect(7,5,12,12);
        c.fillStyle=d.hair;c.fillRect(6,3,13,4);c.fillRect(4,6,5,8);c.fillRect(17,6,3,4);
        if(d.gender==='f'){c.fillRect(3,9,4,10);c.fillRect(19,9,3,10);}
        c.fillStyle='#211f2c';c.fillRect(11,10,2,2);c.fillRect(17,10,2,2);
        c.fillStyle='#e3a276';c.fillRect(14,14,3,1);
        if(d.hat){c.fillStyle=d.hat;c.fillRect(5,1,14,5);c.fillRect(3,5,19,2);}
        c.fillStyle='#ffffff55';c.fillRect(7,18,3,5);
    }
}
