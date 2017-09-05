
			var container, stats;
			var camera, controls, scene, projector, renderer;
			var objects = [], plane, contourLine;
			var mesh, lastKeyframe;

			var mouse = new THREE.Vector2(),
			offset = new THREE.Vector3(),
			INTERSECTED, DRAGGED, SELECTED;

			init();
			animate();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );
          

				scene = new THREE.Scene();
        
				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.z = 1000;
				camera.position.y = -1000;
        
        addSceneLighting();


        // Spline
				var polyLineGeometry = polyLine( new THREE.Vector3( 0,0,0 ), 1500.0, 1200);
				polyLineGeometry.computeLineDistances();

				contourLine = new THREE.Line( polyLineGeometry, new THREE.LineDashedMaterial( { linewidth: 5, color: 0x000000, dashSize: 50, gapSize: 25 } ), THREE.LineStrip );

				//objects.push( contourLine );
				scene.add( contourLine );


        //         // load model
        // var loader = new THREE.OBJMTLLoader();
        // loader.addEventListener( 'load', function ( event ) {
        //
        //   var object = event.content;
        //
        //           object.traverse( function ( child )
        //           {
        //               if ( child instanceof THREE.Mesh )
        //                   child.material.color.setRGB (1, 1, 1);
        //                   objects.push( child );
        //           });
        //
        //           scene.add( object );
        //
        //
        // });
        // loader.load( 'obj/nobelsauna/wall.obj', '' );

        var modelLoadedCallback = function( geometry ) {

					mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x606060, shading:THREE.FlatShading, morphTargets: true } ) );
          
          mesh.traverse( function ( child )
          {
              if ( child instanceof THREE.Mesh )
                  child.material.color.setRGB (1, 1, 1); 
                  objects.push( child );                    
          });
                    
					scene.add( mesh );
				} 

				var json_loader = new THREE.JSONLoader( true );
				//json_loader.load( "obj/female02/Female02_slim.js", modelLoadedCallback);
				//json_loader.load( "models/animated/monster/monster.js", modelLoadedCallback);
					json_loader.load( "models/model.test.json", modelLoadedCallback);
				//json_loader.load( "models/animated/window.js", modelLoadedCallback);
        

				plane = new THREE.Mesh( new THREE.PlaneGeometry( 4000, 4000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
			  
        //plane.visible = false;
				scene.add( plane );

				projector = new THREE.Projector();

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.sortObjects = false;
				renderer.setSize( window.innerWidth, window.innerHeight );

				renderer.shadowMapEnabled = true;
				renderer.shadowMapType = THREE.PCFShadowMap;

				container.appendChild( renderer.domElement );
        
        // apply trackball controls to domElement only
        
				controls = new THREE.TrackballControls( camera, renderer.domElement );
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;

			

				// stats = new Stats();
				// stats.domElement.style.position = 'absolute';
				// stats.domElement.style.right = '0px';
				// stats.domElement.style.top = '0px';
				// container.appendChild( stats.domElement );

				renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
				renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
				renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
        
			}

			function onDocumentMouseMove( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

				//

				var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
				projector.unprojectVector( vector, camera );

				var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

        raycaster.linePrecision = 10;

				var intersects = raycaster.intersectObject( contourLine );
        if (intersects[0]){
          contourLine.material.color.setHex( "0xff0000" );		
        	console.log( intersects[ 0 ].point.sub( offset ) );
          		
        }else{
          contourLine.material.color.setHex( "0x000000" );				
        }

				if ( DRAGGED ) {

					var intersects = raycaster.intersectObject( plane );
          if (intersects[0]){
          	DRAGGED.position.copy( intersects[ 0 ].point.sub( offset ) );
					}
          return;

				}


				var intersects = raycaster.intersectObjects( objects );

				if ( intersects.length > 0 ) {

					if ( INTERSECTED != intersects[ 0 ].object ) {

						//if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

						INTERSECTED = intersects[ 0 ].object;
						//INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

						//plane.position.copy( INTERSECTED.position );
						//plane.lookAt( camera.position );

					}

					container.style.cursor = 'pointer';

				} else {

					//if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

					INTERSECTED = null;

					container.style.cursor = 'auto';

				}

			}

			function onDocumentMouseDown( event ) {

				event.preventDefault();

				var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
				projector.unprojectVector( vector, camera );

				var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

				var intersects = raycaster.intersectObjects( objects );

        

        
				if ( intersects.length > 0 ) {
          
					controls.enabled = false;

          if ( (SELECTED != intersects[ 0 ].object) || SELECTED == null){
            SELECTED = intersects[ 0 ].object; 
          } else {
            SELECTED = null;
          }

          DRAGGED = intersects[ 0 ].object;      
          
          // set plane to cursor position
					plane.position.copy( INTERSECTED.position );

          var intersects = raycaster.intersectObject( plane );
          if (intersects[0]){ 
  
            offset.copy( intersects[ 0 ].point ).sub( plane.position );

            container.style.cursor = 'move';
          }
           
          
				}
        
        applySelectionColor(SELECTED)
        
			}

			function onDocumentMouseUp( event ) {

				event.preventDefault();

				controls.enabled = true;

				if ( INTERSECTED ) {

          // set plane to cursor position
					plane.position.copy( INTERSECTED.position );

					DRAGGED = null;

				}

				container.style.cursor = 'auto';

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			function render() {

				controls.update();

				renderer.render( scene, camera );

			}
      
      function addSceneLighting(){

			  scene.add( new THREE.AmbientLight( 0x505050 ) );

			  var light = new THREE.SpotLight( 0xffffff, 0.5 );
			  light.position.set( 0, -2000, 3000 );
			  light.castShadow = true;

			  light.shadowCameraNear = 200;
			  light.shadowCameraFar = camera.far;
			  light.shadowCameraFov = 50;

		    light.shadowBias = -0.00022;
			  light.shadowDarkness = 0.5;

			  light.shadowMapWidth = 2048;
			  light.shadowMapHeight = 2048;

			  scene.add( light );
      }
      
			function polyLine( center, len, width ) {


				var geometry = new THREE.Geometry();

				vec = [

					new THREE.Vector3( center.x - len/2, center.y - width / 2, center.z),
					new THREE.Vector3( center.x - len/2, center.y + width / 2, center.z),
					new THREE.Vector3( center.x + len/2, center.y + width / 2, center.z),
					new THREE.Vector3( center.x + len/2, center.y - width / 2, center.z),
					new THREE.Vector3( center.x - len/2, center.y - width / 2, center.z),

				]

        for ( var i = 0; i < vec.length; i ++ ) {

          geometry.vertices[ i ] = vec[i];

        }  

				return geometry;

			}
      
      function applySelectionColor(SELECTED){
        
        
        
        //erase all colour
        for ( var i = 0; i < objects.length; i ++ ) {
			    objects[i].traverse( function ( child )
          {
            if ( child instanceof THREE.Mesh )
              child.material.color.setRGB (1, 1, 1); 
          });
        }
        
        // apply color to selection if it exists
        if (SELECTED){          
          SELECTED.material.color.setHex( "0xff0000" );              
        }
        
      }
      
      function changeMorphTargets(value){
        
        if(SELECTED && SELECTED.morphTargetInfluences){
        
				  if ( value != lastKeyframe ) {


            SELECTED.morphTargetInfluences[ 0 ] = 1 - value/100;
            SELECTED.morphTargetInfluences[ 100 ] = value/100;

					  lastKeyframe = value;

					  // console.log( mesh.morphTargetInfluences );

				  }
        }
      }

