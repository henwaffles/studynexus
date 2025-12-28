import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';
import { describe, expect, it, vi } from 'vitest';

describe('ConfirmDialog', () => {
  it('renders and calls confirm/cancel handlers', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Delete"
        message="Are you sure?"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Hidden"
        message="Should not render"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.queryByText('Hidden')).toBeNull();
  });
});
