<template>
<div class="min-h-screen bg-blue-50 flex items-center justify-center px-6 py-12">
  <div class="max-w-6xl w-full bg-white rounded-2xl shadow-lg p-10 space-y-14">
    
    <!-- Encabezado -->
    <div class="text-center space-y-3">
      <h2 class="text-4xl font-bold text-blue-900">
        Bienvenidos a <span class="text-blue-600">Senderos de Luz</span>
      </h2>
      <p class="text-blue-700 text-lg">
        Acompañando con respeto, dignidad y compromiso.
      </p>
      <img src="../img/portada.jpg" alt="Portada" class="mx-auto mt-4 rounded-xl shadow-md max-h-100 object-cover" />
    </div>

    <!-- Misión y Visión -->
    <div class="grid md:grid-cols-2 gap-8">
      <section class="bg-blue-100 rounded-xl p-6 shadow hover:shadow-md transition duration-300 space-y-3">
        <h3 class="text-2xl font-semibold text-blue-800">Misión</h3>
        <p class="text-blue-900">
          Brindar un servicio funerario digno, humano y respetuoso, acompañando a las familias en sus momentos más difíciles con compromiso y calidez.
        </p>
        <img src="../img/mision.jpg" alt="Misión" class="rounded-lg shadow-sm object-cover h-40 w-full" />
      </section>

      <section class="bg-blue-100 rounded-xl p-6 shadow hover:shadow-md transition duration-300 space-y-3">
        <h3 class="text-2xl font-semibold text-blue-800">Visión</h3>
        <p class="text-blue-900">
          Ser reconocidos como la funeraria líder en atención integral, ética y profesional, manteniendo el respeto por la vida y la memoria de nuestros seres queridos.
        </p>
        <img src="../img/vision.jpg" alt="Visión" class="rounded-lg shadow-sm object-cover h-40 w-full" />
      </section>
    </div>

    <!-- Nuestros Servicios -->
    <div class="space-y-6">
      <h3 class="text-3xl font-semibold text-blue-800 text-center">Nuestros Servicios</h3>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-blue-100 p-5 rounded-xl text-blue-900 shadow hover:shadow-md transition space-y-2">
          <img src="../img/247.jpg" alt="Servicio 1" class="rounded-md h-32 w-full object-cover" />
          <h4 class="font-bold text-lg">Atención 24/7</h4>
          <p>Disponibilidad total para atender a las familias en todo momento.</p>
        </div>
        <div class="bg-blue-100 p-5 rounded-xl text-blue-900 shadow hover:shadow-md transition space-y-2">
          <img src="../img/perso.avif" alt="Servicio 2" class="rounded-md h-32 w-full object-cover" />
          <h4 class="font-bold text-lg">Ceremonias Personalizadas</h4>
          <p>Servicios adaptados a las creencias, cultura y deseos familiares.</p>
        </div>
        <div class="bg-blue-100 p-5 rounded-xl text-blue-900 shadow hover:shadow-md transition space-y-2">
          <img src="../img/cremacion.jpg" alt="Servicio 3" class="rounded-md h-32 w-full object-cover" />
          <h4 class="font-bold text-lg">Servicio de Cremacion</h4>
          <p>Proceso de reducir el cuerpo a cenizas mediante altas temperaturas, ofreciendo flexibilidad en el destino final de los restos.</p>
        </div>
        <div class="bg-blue-100 p-5 rounded-xl text-blue-900 shadow hover:shadow-md transition space-y-2">
          <img src="../img/traslado.jpg" alt="Servicio 3" class="rounded-md h-32 w-full object-cover" />
          <h4 class="font-bold text-lg">Traslado</h4>
          <p>Transporte digno y respetuoso del cuerpo desde el lugar de deceso hasta la funeraria o cementerio, gestionando permisos y vehículos.</p>
        </div>
        <div class="bg-blue-100 p-5 rounded-xl text-blue-900 shadow hover:shadow-md transition space-y-2">
          <img src="../img/sepultura.jpg" alt="Servicio 3" class="rounded-md h-32 w-full object-cover" />
          <h4 class="font-bold text-lg">Sepultura</h4>
          <p> Inhumación del cuerpo en un cementerio, incluyendo preparación, féretro y el espacio para el descanso final.</p>
        </div>
      </div>
    </div>

    <!-- Nuestro Equipo -->
    <div class="space-y-6">
      <h3 class="text-3xl font-semibold text-blue-800 text-center">Nuestro Equipo Humano</h3>
      <div class="grid md:grid-cols-2 gap-6 items-center">
        <img src="../img/equipo.jpg" alt="Equipo Humano" class="rounded-xl shadow-md h-64 w-full object-cover" />
        <p class="text-blue-900 text-lg leading-relaxed">
          Contamos con un equipo comprometido, capacitado y humano, que brinda apoyo desde la empatía y el profesionalismo. Cada miembro es parte fundamental del acompañamiento respetuoso que merecen las familias.
        </p>
      </div>
    </div>
  </div>
</div>

</template>

