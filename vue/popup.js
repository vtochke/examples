/**
<div id="test">
	<popup>
		Контент
	</popup>
</div>
*/

const $events = new Vue();

let vm = new Vue({
	el: '#test',
	data: {
		
	},
	methods: {
		showPopup: function() {
			$events.$emit('popupOpen');
		}
	}
})

Vue.component('popup',{
    props: [],
    template: `
    <div class="popup" v-if="show">
        <div class="popup-content">
            <span class="popup-close" @click="close"></span>
            <slot></slot>
        </div>
    </div>`,
    data: function(){
        return {
            show : true
        }
    },
    created: function(){
        $events.$on('popupOpen',() => {
            this.open();
        });
    },
    methods: {
        close: function() {
            this.show = false;
        },
        open: function() {
            this.show = true;
        }
    }
});