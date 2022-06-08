import { css } from 'lit-element';
import * as Colors from "./colors";

export const InkingToolbarButtonStyles = css`

    button {
        position: relative;
    }
    /* prevent Firefox from adding extra styling on focused button */
    button::-moz-focus-inner {
        border: 0;
    }
    button.toolbar-icon {
        background-color: ${Colors.white};
        outline: none;
        border: 2px solid ${Colors.white};
        border-radius: 2px;
        display: inline-block;
        white-space: nowrap;
        padding: 2%;
    }
    button.toolbar-icon.show {
        padding: 1% 2% 2% 2%;
        z-index: 1;
    }
    button.toolbar-icon.vertical-orientation.show {
        padding: 2% 1% 2% 2%;
    }
    button.toolbar-icon.show:focus-visible {
        padding: 2%;
    }
    button.toolbar-icon svg {
        height: 34px;
        width: 34px;
    }
    button.vertical-orientation {
        display: block;
    }
    button.dropdown-button {
        border: none;
        outline: none;
        display: none;
        width: 100%;
        background-color: ${Colors.lightGray};
        font-family: sans-serif;
        font-size: 16px;
    }
    button#erase-all {
        min-width: 200px;
        padding: 25px;
        margin-top: 14px;
    }
    button#erase-all.show {
        display: block;
    }
    button.more-options {
        display: block;
        text-align: left;
        height: 46px;
        background-color: transparent;
        padding: 10px;
    }
    button.more-options svg {
        margin-top: -2px;
        height: 32px;
        padding-bottom: 2px;
    }
    button.more-options p {
        position: absolute;
        top: -1px;
        left: 55px;
    }
    button:hover.toolbar-icon, button:focus.toolbar-icon {
        background-color: ${Colors.silver};
        border-color: ${Colors.silver};
    }
    button.toolbar-icon:focus-visible, button.toolbar-icon.horizontal-orientation.clicked:focus-visible,
    button.toolbar-icon.vertical-orientation.clicked.left:focus-visible,
    button.toolbar-icon.vertical-orientation.clicked.center:focus-visible,
    button.toolbar-icon.vertical-orientation.clicked.right:focus-visible {
        border: 2px solid ${Colors.colorPaletteBackground};
        border-color: ${Colors.charcoal};
    }
    button.toolbar-icon.vertical-orientation.clicked.left:focus-visible,
    button.toolbar-icon.vertical-orientation.clicked.center:focus-visible {
        padding-right: 1px;
    }
    button.toolbar-icon.vertical-orientation.clicked.right:focus-visible {
        padding-left: 1px;
    }
    button:hover#erase-all, button:focus#erase-all, button:hover.more-options, button:focus.more-options {
        background-color: ${Colors.silver};
    }  
    .toolbar-icon {
        height: 50px;
        width: 50px;
        background-size: 47px 47px;
        background-repeat: no-repeat;
        background-position: 0px 0px;
    }
    .toolbar-icon.pencil-icon {
        background-position: 1px 0px;
    }
    .title {
        display: none;
        padding-bottom: 10px;
    }
    .title.show {
        display: block;
    }

    .tooltip {
        position: relative;
        display: inline-block;
    }
    .tooltip-text {
        visibility: hidden;
        background-color: ${Colors.colorPaletteBackground};
        color: ${Colors.black};
        border: 1px solid ${Colors.silver};
        text-align: center;
        font-size: 14px;
        white-space: nowrap;
        padding: 5px;
        border-radius: 5px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        transition: none;
    }
    .toolbar-icon.tooltip .tooltip-text {
        bottom: 125%;
    }
    .toolbar-icon.tooltip.show .tooltip-text {
        bottom: 123%;
    }
    .toolbar-icon.tooltip.bottom .tooltip-text {
        bottom: 125%;
    }
    .toolbar-icon.tooltip.bottom.show .tooltip-text {
        bottom: 120%;
    }
    .toolbar-icon.tooltip.vertical-orientation.left.show .tooltip-text,
    .toolbar-icon.tooltip.vertical-orientation.center.show .tooltip-text {
        bottom: 125%;
        left: 48%;
    }
    .toolbar-icon.tooltip.vertical-orientation.left.show:focus-visible .tooltip-text,
    .toolbar-icon.tooltip.vertical-orientation.center.show:focus-visible .tooltip-text {
        bottom: 125%;
        left: 50%;
    }
    .toolbar-icon.tooltip.vertical-orientation.right.show .tooltip-text {
        bottom: 125%;
        left: 52%;
    }
    .toolbar-icon.tooltip.vertical-orientation.right.show:focus-visible .tooltip-text {
        bottom: 125%;
        left: 50%;
    }
    .toolbar-icon.tooltip.show:focus-visible .tooltip-text {
        bottom: 125%;
    }
    .toolbar-icon.tooltip.bottom.show:focus-visible .tooltip-text {
        bottom: 120%;
    }
    .toolbar-icon.tooltip:focus-visible .tooltip-text {
        bottom: 125%;
    }
    .tooltip:hover .tooltip-text {
        visibility: visible;
        transition: visibility 0.3s ease-out 0.6s;
    }

    .circle {
        width: 40px;
        height: 40px;
        outline: none;
        border-radius: 50%;
        box-sizing: border-box;
        border: 2px solid ${Colors.colorPaletteBackground};
        margin: 7px;
        transition: all 0.1s ease;
    }
    .circle:hover {
        border: 2px solid ${Colors.red}; /* this color should be overridden by proper color class below */
        transition: all 0.1s ease;
    }
    .circle:hover.black, .circle:focus.black  {
        border-color: ${Colors.black};
    }
    .circle:hover.white, .circle:focus.white {
        border-color: ${Colors.white};
    }
    .circle:hover.silver, .circle:focus.silver {
        border-color: ${Colors.silver};
    }
    .circle:hover.gray, .circle:focus.gray {
        border-color: ${Colors.gray};
    }
    .circle:hover.dark-gray, .circle:focus.dark-gray {
        border-color: ${Colors.darkGray};
    }
    .circle:hover.charcoal, .circle:focus.charcoal {
        border-color: ${Colors.charcoal};
    }
    .circle:hover.magenta, .circle:focus.magenta {
        border-color: ${Colors.magenta};
    }
    .circle:hover.red, .circle:focus.red {
        border-color: ${Colors.red};
    }
    .circle:hover.red-orange, .circle:focus.red-orange {
        border-color: ${Colors.redOrange};
    }
    .circle:hover.orange, .circle:focus.orange {
        border-color: ${Colors.orange};
    }
    .circle:hover.gold, .circle:focus.gold {
        border-color: ${Colors.gold};
    }
    .circle:hover.yellow, .circle:focus.yellow {
        border-color: ${Colors.yellow};
    }
    .circle:hover.grass-green, .circle:focus.grass-green {
        border-color: ${Colors.grassGreen};
    }
    .circle:hover.green, .circle:focus.green {
        border-color: ${Colors.green};
    }
    .circle:hover.dark-green, .circle:focus.dark-green {
        border-color: ${Colors.darkGreen};
    }
    .circle:hover.teal, .circle:focus.teal {
        border-color: ${Colors.teal};
    }
    .circle:hover.blue, .circle:focus.blue {
        border-color: ${Colors.blue};
    }
    .circle:hover.indigo, .circle:focus.indigo {
        border-color: ${Colors.indigo};
    }
    .circle:hover.violet, .circle:focus.violet {
        border-color: ${Colors.violet};
    }
    .circle:hover.purple, .circle:focus.purple {
        border-color: ${Colors.purple};
    }
    .circle:hover.beige, .circle:focus.beige {
        border-color: ${Colors.beige};
    }
    .circle:hover.light-brown, .circle:focus.light-brown {
        border-color: ${Colors.lightBrown};
    }
    .circle:hover.brown, .circle:focus.brown {
        border-color: ${Colors.brown};
    }
    .circle:hover.dark-brown, .circle:focus.dark-brown {
        border-color: ${Colors.darkBrown};
    }
    .circle:hover.pastel-pink, .circle:focus.pastel-pink {
        border-color: ${Colors.pastelPink};
    }
    .circle:hover.pastel-orange, .circle:focus.pastel-orange {
        border-color: ${Colors.pastelOrange};
    }
    .circle:hover.pastel-yellow, .circle:focus.pastel-yellow {
        border-color: ${Colors.pastelYellow};
    }
    .circle:hover.pastel-green, .circle:focus.pastel-green {
        border-color: ${Colors.pastelGreen};
    }
    .circle:hover.pastel-blue, .circle:focus.pastel-blue {
        border-color: ${Colors.pastelBlue};
    }
    .circle:hover.pastel-purple, .circle:focus.pastel-purple {
        border-color: ${Colors.pastelPurple};
    }
    .circle:hover.light-blue, .circle:focus.light-blue {
        border-color: ${Colors.lightBlue};
    }
    .circle:hover.pink, .circle:focus.pink {
        border-color: ${Colors.pink};
    }
    .circle.clicked, .circle.clicked:hover, .circle.clicked:focus {
        border: 2px solid ${Colors.colorPaletteBackground};
        box-shadow: 0px 0px 0px 2px black;
        transition: all 0.2s ease;
    }
    .circle.black {                
        background-color: ${Colors.black};
    }            
    .circle.white {              
        background-color: ${Colors.white};
    }
    .circle.silver {            
        background-color: ${Colors.silver};
    }
    .circle.gray {            
        background-color: ${Colors.gray};
    }
    .circle.dark-gray {               
        background-color: ${Colors.darkGray};
    }
    .circle.charcoal {               
        background-color: ${Colors.charcoal};
    }
    .circle.magenta {              
        background-color: ${Colors.magenta};
    }
    .circle.red {
        background-color: ${Colors.red};
    }
    .circle.red-orange {
        background-color: ${Colors.redOrange};
    }
    .circle.orange {
        background-color: ${Colors.orange};
    }
    .circle.gold {
        background-color: ${Colors.gold};
    }
    .circle.yellow {
        background-color: ${Colors.yellow};
    }
    .circle.grass-green {
        background-color: ${Colors.grassGreen};
    }
    .circle.green {
        background-color: ${Colors.green};
    }
    .circle.dark-green {
        background-color: ${Colors.darkGreen};
    }
    .circle.teal {
        background-color: ${Colors.teal};
    }
    .circle.blue {
        background-color: ${Colors.blue};
    }
    .circle.indigo {
        background-color: ${Colors.indigo};
    }
    .circle.violet {
        background-color: ${Colors.violet};
    }
    .circle.purple {
        background-color: ${Colors.purple};
    }
    .circle.beige {
        background-color: ${Colors.beige};
    }
    .circle.light-brown {
        background-color: ${Colors.lightBrown};
    }
    .circle.brown {
        background-color: ${Colors.brown};
    }
    .circle.dark-brown {
        background-color: ${Colors.darkBrown};
    }
    .circle.pastel-pink {
        background-color: ${Colors.pastelPink};
    }
    .circle.pastel-orange {
        background-color: ${Colors.pastelOrange};
    }
    .circle.pastel-yellow {
        background-color: ${Colors.pastelYellow};
    }
    .circle.pastel-green {
        background-color: ${Colors.pastelGreen};
    }
    .circle.pastel-blue {
        background-color: ${Colors.pastelBlue};
    }
    .circle.pastel-purple {
        background-color: ${Colors.pastelPurple};
    }
    .circle.light-blue {
        background-color: ${Colors.lightBlue};
    }
    .circle.pink {
        background-color: ${Colors.pink};
    }

    /* change tool color on selection (horizontal orientation) */

    button.clicked.black.horizontal-orientation {
        border-bottom-color: ${Colors.black};
        box-shadow: 0 3px 0px 0px ${Colors.black};
    }  
    button.clicked.white.horizontal-orientation {
        border-bottom-color: ${Colors.white};
        box-shadow: 0 3px 0px 0px ${Colors.white};
    }        
    button.clicked.silver.horizontal-orientation {
        border-bottom-color: ${Colors.silver};
        box-shadow: 0 3px 0px 0px ${Colors.silver};
    }             
    button.clicked.gray.horizontal-orientation {
        border-bottom-color: ${Colors.gray};
        box-shadow: 0 3px 0px 0px ${Colors.gray};
    }               
    button.clicked.dark-gray.horizontal-orientation {
        border-bottom-color: ${Colors.darkGray};
        box-shadow: 0 3px 0px 0px ${Colors.darkGray};
    }              
    button.clicked.charcoal.horizontal-orientation {
        border-bottom-color: ${Colors.charcoal};
        box-shadow: 0 3px 0px 0px ${Colors.charcoal};
    }      
    button.clicked.magenta.horizontal-orientation {
        border-bottom-color: ${Colors.magenta};
        box-shadow: 0 3px 0px 0px ${Colors.magenta};
    }    
    button.clicked.red.horizontal-orientation {
        border-bottom-color: ${Colors.red};
        box-shadow: 0 3px 0px 0px ${Colors.red};
    }    
    button.clicked.red-orange.horizontal-orientation {
        border-bottom-color: ${Colors.redOrange};
        box-shadow: 0 3px 0px 0px ${Colors.redOrange};
    }            
    button.clicked.orange.horizontal-orientation {
        border-bottom-color: ${Colors.orange};
        box-shadow: 0 3px 0px 0px ${Colors.orange};
    }      
    button.clicked.gold.horizontal-orientation {
        border-bottom-color: ${Colors.gold};
        box-shadow: 0 3px 0px 0px ${Colors.gold};
    }      
    button.clicked.yellow.horizontal-orientation {
        border-bottom-color: ${Colors.yellow};
        box-shadow: 0 3px 0px 0px ${Colors.yellow};
    }      
    button.clicked.grass-green.horizontal-orientation {
        border-bottom-color: ${Colors.grassGreen};
        box-shadow: 0 3px 0px 0px ${Colors.grassGreen};
    }               
    button.clicked.green.horizontal-orientation {
        border-bottom-color: ${Colors.green};
        box-shadow: 0 3px 0px 0px ${Colors.green};
    }                
    button.clicked.dark-green.horizontal-orientation {
        border-bottom-color: ${Colors.darkGreen};
        box-shadow: 0 3px 0px 0px ${Colors.darkGreen};
    }                
    button.clicked.teal.horizontal-orientation {
        border-bottom-color: ${Colors.teal};
        box-shadow: 0 3px 0px 0px ${Colors.teal};
    }                 
    button.clicked.blue.horizontal-orientation {
        border-bottom-color: ${Colors.blue};
        box-shadow: 0 3px 0px 0px ${Colors.blue};
    }                 
    button.clicked.indigo.horizontal-orientation {
        border-bottom-color: ${Colors.indigo};
        box-shadow: 0 3px 0px 0px ${Colors.indigo};
    }      
    button.clicked.violet.horizontal-orientation {
        border-bottom-color: ${Colors.violet};
        box-shadow: 0 3px 0px 0px ${Colors.violet};
    }      
    button.clicked.purple.horizontal-orientation {
        border-bottom-color: ${Colors.purple};
        box-shadow: 0 3px 0px 0px ${Colors.purple};
    }      
    button.clicked.beige.horizontal-orientation {
        border-bottom-color: ${Colors.beige};
        box-shadow: 0 3px 0px 0px ${Colors.beige};
    }      
    button.clicked.light-brown.horizontal-orientation {
        border-bottom-color: ${Colors.lightBrown};
        box-shadow: 0 3px 0px 0px ${Colors.lightBrown};
    }      
    button.clicked.brown.horizontal-orientation {
        border-bottom-color: ${Colors.brown};
        box-shadow: 0 3px 0px 0px ${Colors.brown};
    }      
    button.clicked.dark-brown.horizontal-orientation {
        border-bottom-color: ${Colors.darkBrown};
        box-shadow: 0 3px 0px 0px ${Colors.darkBrown};
    }      
    button.clicked.pastel-pink.horizontal-orientation {
        border-bottom-color: ${Colors.pastelPink};
        box-shadow: 0 3px 0px 0px ${Colors.pastelPink};
    }      
    button.clicked.pastel-orange.horizontal-orientation {
        border-bottom-color: ${Colors.pastelOrange};
        box-shadow: 0 3px 0px 0px ${Colors.pastelOrange};
    }      
    button.clicked.pastel-yellow.horizontal-orientation {
        border-bottom-color: ${Colors.pastelYellow};
        box-shadow: 0 3px 0px 0px ${Colors.pastelYellow};
    }      
    button.clicked.pastel-green.horizontal-orientation {
        border-bottom-color: ${Colors.pastelGreen};
        box-shadow: 0 3px 0px 0px ${Colors.pastelGreen};
    }      
    button.clicked.pastel-blue.horizontal-orientation {
        border-bottom-color: ${Colors.pastelBlue};
        box-shadow: 0 3px 0px 0px ${Colors.pastelBlue};
    }      
    button.clicked.pastel-purple.horizontal-orientation {
        border-bottom-color: ${Colors.pastelPurple};
        box-shadow: 0 3px 0px 0px ${Colors.pastelPurple};
    }         
    button.clicked.light-blue.horizontal-orientation {
        border-bottom-color: ${Colors.lightBlue};
        box-shadow: 0 3px 0px 0px ${Colors.lightBlue};
    }      
    button.clicked.pink.horizontal-orientation {
        border-bottom-color: ${Colors.pink};
        box-shadow: 0 3px 0px 0px ${Colors.pink};
    }

    button.clicked.horizontal-orientation.show {
        background-color: ${Colors.colorPaletteBackground};
        box-shadow: none;
        padding-top: 6px;
        padding-bottom: 8px;
        border: 2px solid ${Colors.gray};
        border-bottom: none;
    }

    button.clicked.horizontal-orientation.bottom.show {
        background-color: ${Colors.colorPaletteBackground};
        box-shadow: none;
        padding-top: 8px;
        border: 2px solid ${Colors.gray};
        border-top: none;
    }

    /* change tool color on selection (vertical orientation) */

    button.clicked.black.vertical-orientation.left, button.clicked.black.vertical-orientation.center {
        border-right-color: ${Colors.black};
        box-shadow: 3px 0px 0px 0px ${Colors.black};
    }  
    button.clicked.white.vertical-orientation.left, button.clicked.white.vertical-orientation.center {
        border-right-color: ${Colors.white};
        box-shadow: 3px 0px 0px 0px ${Colors.white};
    }        
    button.clicked.silver.vertical-orientation.left, button.clicked.silver.vertical-orientation.center {
        border-right-color: ${Colors.silver};
        box-shadow: 3px 0px 0px 0px ${Colors.silver};
    }             
    button.clicked.gray.vertical-orientation.left, button.clicked.gray.vertical-orientation.center {
        border-right-color: ${Colors.gray};
        box-shadow: 3px 0px 0px 0px ${Colors.gray};
    }               
    button.clicked.dark-gray.vertical-orientation.left, button.clicked.gray.vertical-orientation.center {
        border-right-color: ${Colors.darkGray};
        box-shadow: 3px 0px 0px 0px ${Colors.darkGray};
    }              
    button.clicked.charcoal.vertical-orientation.left, button.clicked.charcoal.vertical-orientation.center {
        border-right-color: ${Colors.charcoal};
        box-shadow: 3px 0px 0px 0px ${Colors.charcoal};
    }      
    button.clicked.magenta.vertical-orientation.left, button.clicked.magenta.vertical-orientation.center {
        border-right-color: ${Colors.magenta};
        box-shadow: 3px 0px 0px 0px ${Colors.magenta};
    }    
    button.clicked.red.vertical-orientation.left, button.clicked.red.vertical-orientation.center {
        border-right-color: ${Colors.red};
        box-shadow: 3px 0px 0px 0px ${Colors.red};
    }    
    button.clicked.red-orange.vertical-orientation.left, button.clicked.red-orange.vertical-orientation.center {
        border-right-color: ${Colors.redOrange};
        box-shadow: 3px 0px 0px 0px ${Colors.redOrange};
    }            
    button.clicked.orange.vertical-orientation.left, button.clicked.orange.vertical-orientation.center {
        border-right-color: ${Colors.orange};
        box-shadow: 3px 0px 0px 0px ${Colors.orange};
    }      
    button.clicked.gold.vertical-orientation.left, button.clicked.gold.vertical-orientation.center {
        border-right-color: ${Colors.gold};
        box-shadow: 3px 0px 0px 0px ${Colors.gold};
    }      
    button.clicked.yellow.vertical-orientation.left, button.clicked.yellow.vertical-orientation.center {
        border-right-color: ${Colors.yellow};
        box-shadow: 3px 0px 0px 0px ${Colors.yellow};
    }      
    button.clicked.grass-green.vertical-orientation.left, button.clicked.grass-green.vertical-orientation.center {
        border-right-color: ${Colors.grassGreen};
        box-shadow: 3px 0px 0px 0px ${Colors.grassGreen};
    }               
    button.clicked.green.vertical-orientation.left, button.clicked.green.vertical-orientation.center {
        border-right-color: ${Colors.green};
        box-shadow: 3px 0px 0px 0px ${Colors.green};
    }                
    button.clicked.dark-green.vertical-orientation.left, button.clicked.dark-green.vertical-orientation.center {
        border-right-color: ${Colors.darkGreen};
        box-shadow: 3px 0px 0px 0px ${Colors.darkGreen};
    }                
    button.clicked.teal.vertical-orientation.left, button.clicked.teal.vertical-orientation.center {
        border-right-color: ${Colors.teal};
        box-shadow: 3px 0px 0px 0px ${Colors.teal};
    }                 
    button.clicked.blue.vertical-orientation.left, button.clicked.blue.vertical-orientation.center {
        border-right-color: ${Colors.blue};
        box-shadow: 3px 0px 0px 0px ${Colors.blue};
    }                 
    button.clicked.indigo.vertical-orientation.left, button.clicked.indigo.vertical-orientation.center {
        border-right-color: ${Colors.indigo};
        box-shadow: 3px 0px 0px 0px ${Colors.indigo};
    }      
    button.clicked.violet.vertical-orientation.left, button.clicked.violet.vertical-orientation.center {
        border-right-color: ${Colors.violet};
        box-shadow: 3px 0px 0px 0px ${Colors.violet};
    }      
    button.clicked.purple.vertical-orientation.left, button.clicked.purple.vertical-orientation.center {
        border-right-color: ${Colors.purple};
        box-shadow: 3px 0px 0px 0px ${Colors.purple};
    }      
    button.clicked.beige.vertical-orientation.left, button.clicked.beige.vertical-orientation.center {
        border-right-color: ${Colors.beige};
        box-shadow: 3px 0px 0px 0px ${Colors.beige};
    }      
    button.clicked.light-brown.vertical-orientation.left, button.clicked.light-brown.vertical-orientation.center {
        border-right-color: ${Colors.lightBrown};
        box-shadow: 3px 0px 0px 0px ${Colors.lightBrown};
    }      
    button.clicked.brown.vertical-orientation.left, button.clicked.brown.vertical-orientation.center {
        border-right-color: ${Colors.brown};
        box-shadow: 3px 0px 0px 0px ${Colors.brown};
    }      
    button.clicked.dark-brown.vertical-orientation.left, button.clicked.dark-brown.vertical-orientation.center  {
        border-right-color: ${Colors.darkBrown};
        box-shadow: 3px 0px 0px 0px ${Colors.darkBrown};
    }      
    button.clicked.pastel-pink.vertical-orientation.left, button.clicked.pastel-pink.vertical-orientation.center {
        border-right-color: ${Colors.pastelPink};
        box-shadow: 3px 0px 0px 0px ${Colors.pastelPink};
    }      
    button.clicked.pastel-orange.vertical-orientation.left, button.clicked.pastel-orange.vertical-orientation.center {
        border-right-color: ${Colors.pastelOrange};
        box-shadow: 3px 0px 0px 0px ${Colors.pastelOrange};
    }      
    button.clicked.pastel-yellow.vertical-orientation.left, button.clicked.pastel-yellow.vertical-orientation.center {
        border-right-color: ${Colors.pastelYellow};
        box-shadow: 3px 0px 0px 0px ${Colors.pastelYellow};
    }      
    button.clicked.pastel-green.vertical-orientation.left, button.clicked.pastel-green.vertical-orientation.center {
        border-right-color: ${Colors.pastelGreen};
        box-shadow: 3px 0px 0px 0px ${Colors.pastelGreen};
    }      
    button.clicked.pastel-blue.vertical-orientation.left, button.clicked.pastel-blue.vertical-orientation.center {
        border-right-color: ${Colors.pastelBlue};
        box-shadow: 3px 0px 0px 0px ${Colors.pastelBlue};
    }      
    button.clicked.pastel-purple.vertical-orientation.left, button.clicked.pastel-purple.vertical-orientation.center {
        border-right-color: ${Colors.pastelPurple};
        box-shadow: 3px 0px 0px 0px ${Colors.pastelPurple};
    }         
    button.clicked.light-blue.vertical-orientation.left, button.clicked.light-blue.vertical-orientation.center {
        border-right-color: ${Colors.lightBlue};
        box-shadow: 3px 0px 0px 0px ${Colors.lightBlue};
    }      
    button.clicked.pink.vertical-orientation.left, button.clicked.pink.vertical-orientation.center {
        border-right-color: ${Colors.pink};
        box-shadow: 3px 0px 0px 0px ${Colors.pink};
    }

    button.clicked.vertical-orientation.left.show, button.clicked.vertical-orientation.center.show {
        background-color: ${Colors.colorPaletteBackground};
        box-shadow: none;
        padding-right: 3px;
        border: 2px solid ${Colors.gray};
        border-right: none;
    }

    button.clicked.black.vertical-orientation.right {
        border-left-color: ${Colors.black};
        box-shadow: -3px 0px 0px 0px ${Colors.black};
    }  
    button.clicked.white.vertical-orientation.right {
        border-left-color: ${Colors.white};
        box-shadow: -3px 0px 0px 0px ${Colors.white};
    }        
    button.clicked.silver.vertical-orientation.right {
        border-left-color: ${Colors.silver};
        box-shadow: -3px 0px 0px 0px ${Colors.silver};
    }             
    button.clicked.gray.vertical-orientation.right {
        border-left-color: ${Colors.gray};
        box-shadow: -3px 0px 0px 0px ${Colors.gray};
    }               
    button.clicked.dark-gray.vertical-orientation.right {
        border-left-color: ${Colors.darkGray};
        box-shadow: -3px 0px 0px 0px ${Colors.darkGray};
    }              
    button.clicked.charcoal.vertical-orientation.right {
        border-left-color: ${Colors.charcoal};
        box-shadow: -3px 0px 0px 0px ${Colors.charcoal};
    }      
    button.clicked.magenta.vertical-orientation.right {
        border-left-color: ${Colors.magenta};
        box-shadow: -3px 0px 0px 0px ${Colors.magenta};
    }    
    button.clicked.red.vertical-orientation.right {
        border-left-color: ${Colors.red};
        box-shadow: -3px 0px 0px 0px ${Colors.red};
    }    
    button.clicked.red-orange.vertical-orientation.right {
        border-left-color: ${Colors.redOrange};
        box-shadow: -3px 0px 0px 0px ${Colors.redOrange};
    }            
    button.clicked.orange.vertical-orientation.right {
        border-left-color: ${Colors.orange};
        box-shadow: -3px 0px 0px 0px ${Colors.orange};
    }      
    button.clicked.gold.vertical-orientation.right {
        border-left-color: ${Colors.gold};
        box-shadow: -3px 0px 0px 0px ${Colors.gold};
    }      
    button.clicked.yellow.vertical-orientation.right {
        border-left-color: ${Colors.yellow};
        box-shadow: -3px 0px 0px 0px ${Colors.yellow};
    }      
    button.clicked.grass-green.vertical-orientation.right {
        border-left-color: ${Colors.grassGreen};
        box-shadow: -3px 0px 0px 0px ${Colors.grassGreen};
    }               
    button.clicked.green.vertical-orientation.right {
        border-left-color: ${Colors.green};
        box-shadow: -3px 0px 0px 0px ${Colors.green};
    }                
    button.clicked.dark-green.vertical-orientation.right {
        border-left-color: ${Colors.darkGreen};
        box-shadow: -3px 0px 0px 0px ${Colors.darkGreen};
    }                
    button.clicked.teal.vertical-orientation.right {
        border-left-color: ${Colors.teal};
        box-shadow: -3px 0px 0px 0px ${Colors.teal};
    }                 
    button.clicked.blue.vertical-orientation.right {
        border-left-color: ${Colors.blue};
        box-shadow: -3px 0px 0px 0px ${Colors.blue};
    }                 
    button.clicked.indigo.vertical-orientation.right {
        border-left-color: ${Colors.indigo};
        box-shadow: -3px 0px 0px 0px ${Colors.indigo};
    }      
    button.clicked.violet.vertical-orientation.right {
        border-left-color: ${Colors.violet};
        box-shadow: -3px 0px 0px 0px ${Colors.violet};
    }      
    button.clicked.purple.vertical-orientation.right {
        border-left-color: ${Colors.purple};
        box-shadow: -3px 0px 0px 0px ${Colors.purple};
    }      
    button.clicked.beige.vertical-orientation.right {
        border-left-color: ${Colors.beige};
        box-shadow: -3px 0px 0px 0px ${Colors.beige};
    }      
    button.clicked.light-brown.vertical-orientation.right {
        border-left-color: ${Colors.lightBrown};
        box-shadow: -3px 0px 0px 0px ${Colors.lightBrown};
    }      
    button.clicked.brown.vertical-orientation.right {
        border-left-color: ${Colors.brown};
        box-shadow: -3px 0px 0px 0px ${Colors.brown};
    }      
    button.clicked.dark-brown.vertical-orientation.right {
        border-left-color: ${Colors.darkBrown};
        box-shadow: -3px 0px 0px 0px ${Colors.darkBrown};
    }      
    button.clicked.pastel-pink.vertical-orientation.right {
        border-left-color: ${Colors.pastelPink};
        box-shadow: -3px 0px 0px 0px ${Colors.pastelPink};
    }      
    button.clicked.pastel-orange.vertical-orientation.right {
        border-left-color: ${Colors.pastelOrange};
        box-shadow: -3px 0px 0px 0px ${Colors.pastelOrange};
    }      
    button.clicked.pastel-yellow.vertical-orientation.right {
        border-left-color: ${Colors.pastelYellow};
        box-shadow: -3px 0px 0px 0px ${Colors.pastelYellow};
    }      
    button.clicked.pastel-green.vertical-orientation.right {
        border-left-color: ${Colors.pastelGreen};
        box-shadow: -3px 0px 0px 0px ${Colors.pastelGreen};
    }      
    button.clicked.pastel-blue.vertical-orientation.right {
        border-left-color: ${Colors.pastelBlue};
        box-shadow: -3px 0px 0px 0px ${Colors.pastelBlue};
    }      
    button.clicked.pastel-purple.vertical-orientation.right {
        border-left-color: ${Colors.pastelPurple};
        box-shadow: -3px 0px 0px 0px ${Colors.pastelPurple};
    }         
    button.clicked.light-blue.vertical-orientation.right {
        border-left-color: ${Colors.lightBlue};
        box-shadow: -3px 0px 0px 0px ${Colors.lightBlue};
    }      
    button.clicked.pink.vertical-orientation.right {
        border-left-color: ${Colors.pink};
        box-shadow: -3px 0px 0px 0px ${Colors.pink};
    }

    button.clicked.vertical-orientation.right.show {
        background-color: ${Colors.colorPaletteBackground};
        box-shadow: none;
        padding-left: 3px;
        border: 2px solid ${Colors.gray};
        border-left: none;
    }
    
`;