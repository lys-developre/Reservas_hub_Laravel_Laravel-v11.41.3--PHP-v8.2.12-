import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import VideoThumbnail from './VideoThumbnail';

const SpaceModal = ({ isOpen, closeModal, space }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    if (!space) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                {/* Overlay oscuro */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/75" />
                </Transition.Child>

                {/* Contenido del modal */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                {/* Galería de imágenes/videos */}
                                <div className="relative aspect-w-16 aspect-h-9 mb-6">
                                    {space.gallery_media?.[currentMediaIndex]?.type === 'video' ? (
                                        <video
                                            src={space.gallery_media[currentMediaIndex].url}
                                            className="w-full h-full object-cover rounded-lg"
                                            controls
                                            poster={space.gallery_media[currentMediaIndex].thumbnail}
                                        />
                                    ) : (
                                        <img
                                            src={space.gallery_media?.[currentMediaIndex]?.url || space.image_url}
                                            alt={space.nombre}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    )}
                                </div>

                                {/* Miniaturas */}
                                {space.gallery_media?.length > 1 && (
                                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                        {space.gallery_media.map((media, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentMediaIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2
                                                    ${currentMediaIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                                            >
                                                {media.type === 'video' ? (
                                                    <VideoThumbnail videoUrl={media.url} />
                                                ) : (
                                                    <img
                                                        src={media.url}
                                                        alt={`${space.nombre} - ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Información del espacio */}
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl font-bold text-gray-900 mb-4"
                                >
                                    {space.nombre}
                                </Dialog.Title>

                                <p className="text-gray-600 mb-6">
                                    {space.descripcion}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {space.aforo && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Capacidad</h4>
                                            <p className="text-gray-600">{space.aforo} personas</p>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Precio</h4>
                                        <p className="text-gray-600">{space.price}€/hora</p>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        onClick={closeModal}
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        onClick={() => {
                                            console.log('Reservar:', space);
                                        }}
                                    >
                                        Reservar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SpaceModal;