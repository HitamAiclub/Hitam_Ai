import { motion } from 'framer-motion';
import { FiMail, FiEdit, FiTrash2 } from 'react-icons/fi';

function MemberCard({ member, onEdit, onDelete }) {
  return (
    <motion.div 
      className="card flex flex-col h-full"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-1">
        <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">{member.role || 'Member'}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <span className="font-medium mr-2">Roll No:</span>
            <span>{member.rollNo}</span>
          </div>
          
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <span className="font-medium mr-2">Year:</span>
            <span>{member.year}</span>
          </div>
          
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <span className="font-medium mr-2">Branch:</span>
            <span>{member.branch}</span>
          </div>
          
          <div className="flex items-center text-sm text-primary-500">
            <FiMail className="mr-2" />
            <a href={`mailto:${member.email}`} className="truncate hover:underline">
              {member.email}
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-4 flex justify-end space-x-2 border-t border-neutral-200 dark:border-neutral-700">
        <button 
          onClick={() => onEdit(member)} 
          className="p-2 text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-full"
          aria-label="Edit member"
        >
          <FiEdit size={18} />
        </button>
        
        <button 
          onClick={() => onDelete(member.id)} 
          className="p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-full"
          aria-label="Delete member"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}

export default MemberCard;