import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import type { PlatformSetting } from '../../types';

const PlatformSettingsPage = () => {
  const queryClient = useQueryClient();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateSetting(key, value),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[variables.key];
        return next;
      });
      toast.success('Setting updated successfully');
    },
    onError: () => {
      toast.error('Failed to update setting');
    },
  });

  const settings: PlatformSetting[] = data?.data ?? [];

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    const value = editedValues[key];
    if (value !== undefined) {
      updateMutation.mutate({ key, value });
    }
  };

  const handleReset = (key: string, originalValue: string) => {
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    // Reset the input
    const input = document.getElementById(`setting-${key}`) as HTMLInputElement;
    if (input) input.value = originalValue;
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure global platform parameters</p>
        </div>
        {hasChanges && (
          <span className="text-sm text-warning font-medium">
            {Object.keys(editedValues).length} unsaved change(s)
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : settings.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="No settings configured"
            description="Platform settings will appear here once they are created."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {settings.map((setting) => {
              const isEdited = editedValues[setting.key] !== undefined;
              const currentValue = isEdited ? editedValues[setting.key] : setting.value;

              return (
                <div key={setting.key} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Key & Description */}
                    <div className="lg:w-1/3">
                      <p className="font-mono text-sm font-semibold text-gray-800">{setting.key}</p>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Type: {setting.type} · Updated: {new Date(setting.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Value Input */}
                    <div className="lg:flex-1">
                      {setting.type === 'BOOLEAN' ? (
                        <select
                          id={`setting-${setting.key}`}
                          value={currentValue}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : setting.type === 'JSON' ? (
                        <textarea
                          id={`setting-${setting.key}`}
                          value={currentValue}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      ) : (
                        <input
                          id={`setting-${setting.key}`}
                          type={setting.type === 'NUMBER' ? 'number' : 'text'}
                          value={currentValue}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          step={setting.type === 'NUMBER' ? '0.01' : undefined}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:w-auto">
                      {isEdited && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSave(setting.key)}
                            disabled={updateMutation.isPending}
                          >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReset(setting.key, setting.value)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformSettingsPage;
