// CreatorField.jsx
import { Input } from 'antd';

/**
 * Campo visual para mostrar el nombre del creador de la tarea.
 * El _id del creador debe gestionarse en lógica interna, no es necesario mostrarlo.
 */
const CreatorField = ({ value }) => {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Creador</h2>
            <Input
                value={value} // Ej: "Alexandro Tellez"
                readOnly
                className="bg-white text-black border border-gray-600 pointer-events-none focus:outline-none focus:ring-0 focus:border-transparent"
            />
        </div>
    );
};

export default CreatorField;
