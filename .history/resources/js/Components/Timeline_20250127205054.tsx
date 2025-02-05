import React from "react";
import { Edit as EditIcon, Trash as TrashIcon } from "lucide-react";

interface TimelineField {
    key: string; // The field key in the data
    label: string; // Label to display for the field
    render?: (value: any) => React.ReactNode; // Optional custom render function
}

interface TimelineAction {
    icon: React.ReactNode; // Action icon
    onClick: (id: number) => void; // Callback for the action
}

interface TimelineItemProps {
    id: number;
    fields: { [key: string]: any }; // Data fields for the item
    actions?: TimelineAction[]; // Actions for the item
    hasNext: boolean; // Indicates if there is another item after this one
}

interface TimelineProps {
    items: TimelineItemProps[]; // List of timeline items
    fieldConfig: TimelineField[]; // Configuration for fields
}

const TimelineItem: React.FC<TimelineItemProps> = ({
    id,
    fields,
    actions,
    hasNext,
}) => {
    return (
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-green-500 shadow-md rounded-full"></div>
                {hasNext && <div className="w-px bg-gray-300 flex-1"></div>}
            </div>

            {/* Timeline Content */}
            <div className="mb-6 bg-slate-100 p-4 w-[400px] rounded-md shadow-[2px_0px_10px_0px_#00000024]">
                {Object.keys(fields).map((key) => (
                    <p key={key} className="text-sm text-gray-600">
                        <span className="font-semibold">{key}:</span>{" "}
                        {fields[key]}
                    </p>
                ))}
                {actions && (
                    <div className="mt-2 flex gap-4">
                        {actions.map((action, index) => (
                            <div
                                key={index}
                                onClick={() => action.onClick(id)}
                                className="cursor-pointer"
                            >
                                {action.icon}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Timeline: React.FC<TimelineProps> = ({ items, fieldConfig }) => {
    return (
        <div className="timeline">
            {items.map((item, index) => (
                <TimelineItem
                    key={item.id}
                    id={item.id}
                    fields={fieldConfig.reduce((acc, field) => {
                        acc[field.label] = field.render
                            ? field.render(item.fields[field.key])
                            : item.fields[field.key];
                        return acc;
                    }, {} as { [key: string]: any })}
                    actions={item.actions}
                    hasNext={index < items.length - 1} // Check if there’s a next item
                />
            ))}
        </div>
    );
};

export default Timeline;
