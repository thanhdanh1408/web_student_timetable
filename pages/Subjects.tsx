import React, { useState } from 'react';
import { useSubjects } from '../hooks/useDatabase';
import { Subject } from '../types';
import { Plus, Trash2, Edit2, BookOpen, Loader2 } from 'lucide-react';

const Subjects = () => {
  const { subjects, loading, createSubject, updateSubject, deleteSubject: deleteSubjectHook } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({});

  const handleSave = async () => {
    if (!currentSubject.name) return;

    try {
        let codeToUse = currentSubject.code;

        // Auto-generate code if adding new (M01, M02, ...)
        if (!currentSubject.id) {
            const nextNum = subjects.length + 1;
            codeToUse = `M${nextNum.toString().padStart(2, '0')}`;
            
            await createSubject({
                name: currentSubject.name,
                code: codeToUse!,
                location: currentSubject.location,
                color: currentSubject.color || '#3b82f6'
            });
        } else {
            await updateSubject(currentSubject.id, {
                name: currentSubject.name,
                code: codeToUse!,
                location: currentSubject.location,
                color: currentSubject.color || '#3b82f6'
            });
        }
        
        setIsModalOpen(false);
        setCurrentSubject({});
    } catch (e) {
        alert("Lỗi khi lưu môn học");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      await deleteSubjectHook(id);
    }
  };

  const openModal = (subject?: Subject) => {
    setCurrentSubject(subject || { color: '#3b82f6' });
    setIsModalOpen(true);
  };

  if (loading && subjects.length === 0) {
      return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Môn học</h1>
           <p className="text-gray-500">Quản lý các khóa học đã đăng ký</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Thêm Môn học
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-2 w-full" style={{ backgroundColor: subject.color }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(subject)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(subject.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{subject.name}</h3>
              <p className="text-sm font-semibold text-gray-500 mb-4">{subject.code}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Địa điểm:</span>
                  <span className="font-medium">{subject.location || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{currentSubject.id ? 'Sửa Môn học' : 'Thêm Môn học'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={currentSubject.name || ''}
                  onChange={e => setCurrentSubject({...currentSubject, name: e.target.value})}
                  placeholder="VD: Toán cao cấp"
                />
              </div>
              
              {/* Removed manual Code input and Professor input */}
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                   <input
                     type="color"
                     className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer bg-white"
                     value={currentSubject.color || '#3b82f6'}
                     onChange={e => setCurrentSubject({...currentSubject, color: e.target.value})}
                   />
                </div>
                 <div>
                   {/* Placeholder for alignment if needed, or remove grid if single item */}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={currentSubject.location || ''}
                  onChange={e => setCurrentSubject({...currentSubject, location: e.target.value})}
                  placeholder="Phòng 301, Nhà C"
                />
              </div>

              {/* Info note about auto-generated code */}
              {!currentSubject.id && (
                  <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                      * Mã môn sẽ được tự động tạo là <strong>M{(subjects.length + 1).toString().padStart(2, '0')}</strong>
                  </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;