
interface SkeletonProps {
    cantidad?: number
    className?: string
}

export function Skeleton({
                             cantidad = 3,
                             className = '',
                         }: SkeletonProps) {
    return (
        <div className="flex flex-col gap-3" aria-label="Cargando contenido">
            {Array.from({ length: cantidad }, (_, index) => (
                <div
                    key={index}
                    className={`h-16 animate-pulse rounded-lg bg-gray-200 ${className}`}
                />
            ))}
        </div>
    )
}
