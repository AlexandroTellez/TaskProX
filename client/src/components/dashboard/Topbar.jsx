import { Avatar } from 'antd';

const Topbar = () => {
    const usuario = { nombre: 'Alex Tellez', avatar: 'https://i.pravatar.cc/150?img=3' }; // sustituye con datos reales

    return (
        <header className="flex justify-end items-center px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">{usuario.nombre}</span>
                <Avatar src={usuario.avatar} />
            </div>
        </header>
    );
};

export default Topbar;
